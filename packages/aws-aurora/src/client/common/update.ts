import type { SqlSourceWithResults, SqlRecord, SqlBuilder, SqlSelectStatement, SqlUpdateStatement } from '@ez4/pgsql';
import type { Database, RelationMetadata, Query } from '@ez4/database';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { NumberSchema, ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { RelationWithSchema, RepositoryRelationsWithSchema } from '../../types/repository.js';

import { isDynamicObjectSchema, IsNullishSchema, isNumberSchema, isObjectSchema } from '@ez4/schema';
import { isAnyObject, isEmptyObject } from '@ez4/utils';
import { Index } from '@ez4/database';

import { InvalidAtomicOperation, InvalidRelationFieldError } from './errors.js';
import { canSkipRelationField, isSingleRelationData } from './relation.js';
import { getSelectFields, getSelectFilters } from './select.js';
import { validateFirstSchemaLevel } from './schema.js';
import { createQueryBuilder } from './builder.js';

export const prepareUpdateQuery = async <
  T extends Database.Schema,
  S extends Query.SelectInput<T, R>,
  I extends Database.Indexes,
  R extends RelationMetadata
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.UpdateOneInput<T, S, I, R> | Query.UpdateManyInput<T, S, R>
): Promise<[string, SqlParameter[]]> => {
  const sql = createQueryBuilder();

  const updateRecord = await getUpdateRecord(table, query.data, schema, relations, sql);

  const updateQuery = !isEmptyObject(updateRecord)
    ? sql.update(schema).only(table).record(updateRecord).returning()
    : sql.select(schema).from(table);

  const postUpdateQueries = await preparePostUpdateRelations(table, query.data, schema, relations, updateQuery, sql);

  const allQueries: (SqlSelectStatement | SqlUpdateStatement)[] = [updateQuery, ...postUpdateQueries];

  if (query.where) {
    updateQuery.where(getSelectFilters(query.where, relations, updateQuery, sql));
  }

  if (query.select) {
    if (!postUpdateQueries.length) {
      const selectRecord = getSelectFields(table, query.select, query.include, schema, relations, updateQuery, sql);

      updateQuery.results.record(selectRecord);
    } else {
      const selectQuery = sql.select(schema).from(table);
      const selectFields = getSelectFields(table, query.select, query.include, schema, relations, updateQuery, sql);

      selectQuery.record(selectFields);
      allQueries.push(selectQuery);
    }
  }

  const [statement, variables] = sql.with(allQueries, 'R').build();

  return [statement, variables as SqlParameter[]];
};

const getUpdateRecord = async (
  table: string,
  data: SqlRecord,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  sql: SqlBuilder
) => {
  const record: SqlRecord = {};

  for (const fieldKey in data) {
    const fieldRelation = relations[fieldKey];
    const fieldSchema = schema.properties[fieldKey];
    const fieldValue = data[fieldKey];

    if (fieldRelation) {
      const relationUpdate = await getOnlyRelationKeyUpdate(table, schema, fieldKey, fieldValue, fieldRelation);

      if (relationUpdate) {
        record[relationUpdate.targetColumn] = relationUpdate.targetValue;
      }

      continue;
    }

    if (!isAnyObject(fieldValue)) {
      await validateFirstSchemaLevel(table, fieldValue, fieldSchema);

      record[fieldKey] = fieldValue;
      continue;
    }

    if (isNumberSchema(fieldSchema)) {
      record[fieldKey] = await getAtomicOperationUpdate(table, fieldKey, fieldValue, fieldSchema, sql);
      continue;
    }

    if (isObjectSchema(fieldSchema) && !isDynamicObjectSchema(fieldSchema) && !IsNullishSchema(fieldSchema)) {
      record[fieldKey] = await getUpdateRecord(table, fieldValue, fieldSchema, relations, sql);
      continue;
    }

    record[fieldKey] = sql.rawValue(fieldValue);
  }

  return record;
};

const preparePostUpdateRelations = async (
  table: string,
  data: SqlRecord,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  source: SqlSourceWithResults,
  sql: SqlBuilder
) => {
  const allRelationQueries = [];

  for (const relationAlias in relations) {
    const fieldRelation = relations[relationAlias];
    const fieldValue = data[relationAlias];

    if (canSkipRelationField(schema, fieldValue, fieldRelation)) {
      continue;
    }

    if (!isSingleRelationData(fieldValue)) {
      throw new InvalidRelationFieldError(table, relationAlias);
    }

    const relationUpdate = await getFullRelationTableUpdate(table, relations, source, fieldValue, fieldRelation, sql);

    if (relationUpdate) {
      allRelationQueries.push(relationUpdate);
    }
  }

  return allRelationQueries;
};

const getOnlyRelationKeyUpdate = async (
  table: string,
  schema: ObjectSchema,
  fieldKey: string,
  fieldValue: unknown,
  fieldRelation: RelationWithSchema
) => {
  if (!isSingleRelationData(fieldValue)) {
    throw new InvalidRelationFieldError(table, fieldKey);
  }

  const { targetColumn, targetIndex } = fieldRelation;

  const isForeignRelationKey = targetIndex !== Index.Primary;

  if (!isForeignRelationKey) {
    return undefined;
  }

  const targetSchema = schema.properties[targetColumn];
  const targetValue = fieldValue[targetColumn];

  await validateFirstSchemaLevel(table, targetValue, targetSchema);

  return {
    targetColumn,
    targetValue
  };
};

const getFullRelationTableUpdate = async (
  table: string,
  relations: RepositoryRelationsWithSchema,
  source: SqlSourceWithResults,
  fieldValue: AnyObject,
  fieldRelation: RelationWithSchema,
  sql: SqlBuilder
) => {
  const { targetColumn } = fieldRelation;

  const isFullRelationUpdate = !fieldValue[targetColumn];

  if (!isFullRelationUpdate) {
    return undefined;
  }

  const { sourceTable, sourceColumn, sourceSchema } = fieldRelation;

  const relationRecord = await getUpdateRecord(table, fieldValue, sourceSchema, relations, sql);

  const relationQuery = sql
    .update(sourceSchema)
    .only(sourceTable)
    .record(relationRecord)
    .from(source)
    .where({ [sourceColumn]: source.reference(targetColumn) })
    .as('T');

  const { results } = source;

  if (!results.has(targetColumn)) {
    results.column(targetColumn);
  }

  return relationQuery;
};

const getAtomicOperationUpdate = async (
  table: string,
  fieldKey: string,
  fieldValue: AnyObject,
  fieldSchema: NumberSchema,
  sql: SqlBuilder
) => {
  for (const operation in fieldValue) {
    const value = fieldValue[operation];

    await validateFirstSchemaLevel(table, value, fieldSchema);

    if (value === undefined || value === null) {
      continue;
    }

    switch (operation) {
      case 'increment':
        return sql.rawOperation('+', value);

      case 'decrement':
        return sql.rawOperation('-', value);

      case 'multiply':
        return sql.rawOperation('*', value);

      case 'divide':
        return sql.rawOperation('/', value);

      default:
        throw new InvalidAtomicOperation(fieldKey);
    }
  }

  return undefined;
};
