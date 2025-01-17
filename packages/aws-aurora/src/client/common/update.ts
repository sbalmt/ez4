import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { SqlSourceWithResults, SqlRecord, SqlBuilder } from '@ez4/pgsql';
import type { Database, RelationMetadata, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { isAnyObject, isEmptyObject } from '@ez4/utils';
import { isObjectSchema } from '@ez4/schema';
import { Index } from '@ez4/database';

import { getSelectFilters, getSelectFields } from './select.js';
import { InvalidRelationFieldError } from './errors.js';
import { createQueryBuilder } from './builder.js';
import { isSkippableData } from './data.js';

export const prepareUpdateQuery = <
  T extends Database.Schema,
  S extends Query.SelectInput<T, R>,
  I extends Database.Indexes<T>,
  R extends RelationMetadata
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.UpdateOneInput<T, S, I, R> | Query.UpdateManyInput<T, S, R>
): [string, SqlParameter[]] => {
  const sql = createQueryBuilder();

  const updateRecord = getUpdateRecord(query.data, schema, relations, sql);

  const updateQuery = !isEmptyObject(updateRecord)
    ? sql.update(schema).only(table).record(updateRecord).returning()
    : sql.select(schema).from(table);

  if (query.where) {
    updateQuery.where(getSelectFilters(query.where, relations, updateQuery, sql));
  }

  if (query.select) {
    const selectFields = getSelectFields(query.select, schema, relations, updateQuery, sql);

    updateQuery.results.record(selectFields);
  }

  const queries = [updateQuery, ...preparePostRelations(query.data, relations, updateQuery, sql)];

  const [statement, variables] = sql.with(queries, 'R').build();

  return [statement, variables as SqlParameter[]];
};

const getUpdateRecord = (
  data: SqlRecord,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  sql: SqlBuilder
) => {
  const record: SqlRecord = {};

  for (const fieldKey in data) {
    const fieldValue = data[fieldKey];

    if (isSkippableData(fieldValue)) {
      continue;
    }

    const relationData = relations[fieldKey];

    if (relationData) {
      if (!isAnyObject(fieldValue)) {
        throw new InvalidRelationFieldError(fieldKey);
      }

      const { targetColumn, targetIndex } = relationData;

      const targetValue = fieldValue[targetColumn];

      if (!isSkippableData(targetValue) && targetIndex !== Index.Primary) {
        record[targetColumn] = targetValue;
      }

      continue;
    }

    if (!isAnyObject(fieldValue)) {
      record[fieldKey] = fieldValue;

      continue;
    }

    const fieldSchema = schema.properties[fieldKey];

    const fieldOverwrite =
      !isObjectSchema(fieldSchema) ||
      fieldSchema.definitions?.extensible ||
      fieldSchema.additional ||
      fieldSchema.nullable ||
      fieldSchema.optional;

    if (!fieldOverwrite) {
      record[fieldKey] = getUpdateRecord(fieldValue, fieldSchema, relations, sql);
    } else {
      record[fieldKey] = sql.raw(fieldValue);
    }
  }

  return record;
};

const preparePostRelations = (
  data: SqlRecord,
  relations: RepositoryRelationsWithSchema,
  source: SqlSourceWithResults,
  sql: SqlBuilder
) => {
  const { results } = source;

  const allQueries = [];

  for (const alias in relations) {
    const relationData = relations[alias];
    const fieldValue = data[alias];

    if (!relationData || isSkippableData(fieldValue)) {
      continue;
    }

    if (!isAnyObject(fieldValue) || Array.isArray(fieldValue)) {
      throw new InvalidRelationFieldError(alias);
    }

    const { sourceTable, sourceColumn, sourceSchema, targetColumn } = relationData;

    if (fieldValue[targetColumn]) {
      continue;
    }

    const relationQuery = sql
      .update(sourceSchema)
      .record(getUpdateRecord(fieldValue, sourceSchema, relations, sql))
      .only(sourceTable)
      .from(source)
      .as('T')
      .where({
        [sourceColumn]: source.reference(targetColumn)
      });

    allQueries.push(relationQuery);

    if (!results.has(targetColumn)) {
      results.column(targetColumn);
    }
  }

  return allQueries;
};
