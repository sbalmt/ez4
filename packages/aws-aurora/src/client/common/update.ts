import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { Database, Relations, Query } from '@ez4/database';
import type { SqlStatementWithResults, SqlRecord } from '@ez4/pgsql';
import type { ObjectSchema } from '@ez4/schema';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { isAnyObject, isEmptyObject } from '@ez4/utils';
import { isObjectSchema } from '@ez4/schema';
import { SqlBuilder } from '@ez4/pgsql';
import { Index } from '@ez4/database';

import { detectFieldData, isSkippableData, prepareFieldData } from './data.js';
import { InvalidRelationFieldError } from './errors.js';
import { getSelectFields } from './select.js';

const Sql = new SqlBuilder({
  onPrepareVariable: (value, index, schema) => {
    if (schema) {
      return prepareFieldData(`${index}`, value, schema);
    }

    return detectFieldData(`${index}`, value);
  }
});

export const prepareUpdateQuery = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.UpdateOneInput<T, S, I, R> | Query.UpdateManyInput<T, S, R>
): [string, SqlParameter[]] => {
  const record = getUpdateRecord(query.data, schema, relations);

  const updateQuery = isEmptyObject(record)
    ? Sql.reset().select(schema).from(table).where(query.where)
    : Sql.reset().update(schema).only(table).record(record).where(query.where).returning();

  if (query.select) {
    const selectRecord = getSelectFields(query.select, schema, relations, updateQuery);

    updateQuery.results.record(selectRecord);
  }

  const queries = [updateQuery, ...preparePostRelations(query.data, relations, updateQuery)];

  const [statement, variables] = Sql.with(queries, 'R').build();

  return [statement, variables as SqlParameter[]];
};

const getUpdateRecord = (
  data: SqlRecord,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema
) => {
  const record: SqlRecord = {};

  for (const fieldKey in data) {
    const relationData = relations[fieldKey];
    const fieldValue = data[fieldKey];

    if (isSkippableData(fieldValue)) {
      continue;
    }

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

    const fieldSchema = schema.properties[fieldKey];

    const fieldOverwrite =
      isObjectSchema(fieldSchema) &&
      (fieldSchema.definitions?.extensible ||
        fieldSchema.additional ||
        fieldSchema.nullable ||
        fieldSchema.optional);

    if (fieldOverwrite) {
      record[fieldKey] = Sql.raw(fieldValue);
    } else {
      record[fieldKey] = fieldValue;
    }
  }

  return record;
};

const preparePostRelations = (
  data: SqlRecord,
  relations: RepositoryRelationsWithSchema,
  statement: SqlStatementWithResults
) => {
  const { results } = statement;

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

    const relationQuery = Sql.update(sourceSchema)
      .only(sourceTable)
      .record(fieldValue)
      .from(statement)
      .as('T')
      .where({
        [sourceColumn]: statement.reference(targetColumn)
      });

    allQueries.push(relationQuery);

    if (!results.has(targetColumn)) {
      results.column(targetColumn);
    }
  }

  return allQueries;
};
