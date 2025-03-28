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
import { getSelectFields, getSelectFilters } from './select.js';
import { validateFirstSchemaLevel } from './schema.js';
import { isSingleRelationData } from './relation.js';
import { createQueryBuilder } from './builder.js';
import { isSkippableData } from './data.js';

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

  const updateRecord = await getUpdateRecord(sql, query.data, schema, relations, table);

  const updateQuery = !isEmptyObject(updateRecord)
    ? sql.update(schema).only(table).record(updateRecord).returning()
    : sql.select(schema).from(table);

  const postUpdateQueries = await preparePostUpdateRelations(sql, query.data, relations, updateQuery, table);

  const allQueries: (SqlSelectStatement | SqlUpdateStatement)[] = [updateQuery, ...postUpdateQueries];

  if (query.where) {
    updateQuery.where(getSelectFilters(sql, query.where, relations, updateQuery));
  }

  if (query.select) {
    if (!postUpdateQueries.length) {
      const selectRecord = getSelectFields(sql, query.select, query.include, schema, relations, updateQuery, table);

      updateQuery.results.record(selectRecord);
    } else {
      const selectQuery = sql.select(schema).from(table);
      const selectFields = getSelectFields(sql, query.select, query.include, schema, relations, updateQuery, table);

      selectQuery.record(selectFields);
      allQueries.push(selectQuery);
    }
  }

  const [statement, variables] = sql.with(allQueries, 'R').build();

  return [statement, variables as SqlParameter[]];
};

const getUpdateRecord = async (
  sql: SqlBuilder,
  data: SqlRecord,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  path: string
) => {
  const record: SqlRecord = {};

  for (const fieldKey in data) {
    const fieldValue = data[fieldKey];

    if (isSkippableData(fieldValue)) {
      continue;
    }

    const fieldRelation = relations[fieldKey];
    const fieldPath = `${path}.${fieldKey}`;

    if (fieldRelation) {
      const relationUpdate = await getOnlyRelationKeyUpdate(schema, fieldValue, fieldRelation, fieldPath);

      if (relationUpdate) {
        record[relationUpdate.targetColumn] = relationUpdate.targetValue;
      }

      continue;
    }

    const fieldSchema = schema.properties[fieldKey];

    if (!isAnyObject(fieldValue)) {
      await validateFirstSchemaLevel(fieldValue, fieldSchema, fieldPath);

      record[fieldKey] = fieldValue;
      continue;
    }

    if (isNumberSchema(fieldSchema)) {
      record[fieldKey] = await getAtomicOperationUpdate(sql, fieldKey, fieldValue, fieldSchema, fieldPath);
      continue;
    }

    if (isObjectSchema(fieldSchema) && !isDynamicObjectSchema(fieldSchema) && !IsNullishSchema(fieldSchema)) {
      record[fieldKey] = await getUpdateRecord(sql, fieldValue, fieldSchema, relations, fieldPath);
      continue;
    }

    record[fieldKey] = sql.rawValue(fieldValue);
  }

  return record;
};

const preparePostUpdateRelations = async (
  sql: SqlBuilder,
  data: SqlRecord,
  relations: RepositoryRelationsWithSchema,
  source: SqlSourceWithResults,
  path: string
) => {
  const allRelationQueries = [];

  for (const relationAlias in relations) {
    const fieldRelation = relations[relationAlias];
    const fieldValue = data[relationAlias];

    if (isSkippableData(fieldValue)) {
      continue;
    }

    const fieldPath = `${path}.${relationAlias}`;

    if (!isSingleRelationData(fieldValue)) {
      throw new InvalidRelationFieldError(fieldPath);
    }

    const relationUpdate = await getFullRelationTableUpdate(sql, relations, source, fieldValue, fieldRelation, fieldPath);

    if (relationUpdate) {
      allRelationQueries.push(relationUpdate);
    }
  }

  return allRelationQueries;
};

const getOnlyRelationKeyUpdate = async (schema: ObjectSchema, fieldValue: unknown, fieldRelation: RelationWithSchema, path: string) => {
  if (!isSingleRelationData(fieldValue)) {
    throw new InvalidRelationFieldError(path);
  }

  const { targetColumn, targetIndex } = fieldRelation;

  const isForeignKey = targetIndex !== Index.Primary;
  const targetValue = fieldValue[targetColumn];

  if (!isForeignKey || isSkippableData(targetValue)) {
    return undefined;
  }

  const targetSchema = schema.properties[targetColumn];
  const targetPath = `${path}.${targetColumn}`;

  await validateFirstSchemaLevel(targetValue, targetSchema, targetPath);

  return {
    targetColumn,
    targetValue
  };
};

const getFullRelationTableUpdate = async (
  sql: SqlBuilder,
  relations: RepositoryRelationsWithSchema,
  source: SqlSourceWithResults,
  fieldValue: AnyObject,
  fieldRelation: RelationWithSchema,
  path: string
) => {
  const targetColumn = fieldRelation.targetColumn;
  const targetValue = fieldValue[targetColumn];

  if (!isSkippableData(targetValue) || isEmptyObject(fieldValue)) {
    return undefined;
  }

  const { sourceTable, sourceColumn, sourceSchema } = fieldRelation;

  const record = await getUpdateRecord(sql, fieldValue, sourceSchema, relations, path);

  const relationQuery = sql
    .update(sourceSchema)
    .only(sourceTable)
    .record(record)
    .from(source)
    .where({ [sourceColumn]: source.reference(targetColumn) })
    .as('T');

  const { results } = source;

  if (!results.has(targetColumn)) {
    results.column(targetColumn);
  }

  return relationQuery;
};

const getAtomicOperationUpdate = async (sql: SqlBuilder, fieldKey: string, fieldValue: AnyObject, schema: NumberSchema, path: string) => {
  for (const operation in fieldValue) {
    const value = fieldValue[operation];

    if (value === undefined || value === null) {
      continue;
    }

    await validateFirstSchemaLevel(value, schema, path);

    switch (operation) {
      default:
        throw new InvalidAtomicOperation(`${path}.${fieldKey}`);

      case 'increment':
        return sql.rawOperation('+', value);

      case 'decrement':
        return sql.rawOperation('-', value);

      case 'multiply':
        return sql.rawOperation('*', value);

      case 'divide':
        return sql.rawOperation('/', value);
    }
  }

  return undefined;
};
