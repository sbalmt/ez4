import type { SqlSourceWithResults, SqlRecord, SqlBuilder, SqlUpdateStatement } from '@ez4/pgsql';
import type { NumberSchema, ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { Query } from '@ez4/database';
import type { PgRelationWithSchema, PgRelationRepositoryWithSchema } from '../types/repository';
import type { InternalTableMetadata } from '../types/table';

import { getObjectSchemaProperty, isNumberSchema, isObjectSchema } from '@ez4/schema';
import { InvalidAtomicOperation, InvalidFieldSchemaError, InvalidRelationFieldError } from '@ez4/pgclient';
import { escapeSqlName, mergeSqlAlias, SqlSelectStatement } from '@ez4/pgsql';
import { isAnyObject, isEmptyObject } from '@ez4/utils';
import { Index } from '@ez4/database';

import { getWithSchemaValidation, isDynamicFieldSchema, validateFirstSchemaLevel } from '../utils/schema';
import { getSourceConnectionSchema, getTargetConnectionSchema, getUpdatingSchema, isSingleRelationData } from '../utils/relation';
import { getSelectFields, getSelectFilters } from './select';

export type UpdateQueryOptions = {
  flag?: string;
};

export const prepareUpdateQuery = async <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  builder: SqlBuilder,
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  query: Query.UpdateOneInput<S, T> | Query.UpdateManyInput<S, T>,
  options?: UpdateQueryOptions
) => {
  const updateRecord = await getUpdateRecord(builder, query.data, schema, relations, table);

  const updateQuery = !isEmptyObject(updateRecord)
    ? builder.update(schema).only(table).record(updateRecord).returning()
    : builder.select(schema).from(table);

  const allQueries: (SqlSelectStatement | SqlUpdateStatement)[] = [];

  if (query.select) {
    if (updateQuery instanceof SqlSelectStatement) {
      const selectFields = getSelectFields(builder, query.select, query.include, schema, relations, updateQuery, table);

      updateQuery.record(selectFields).lock(query.lock);
    } else {
      const selectQuery = builder.select(schema).from(table).lock(query.lock);
      const selectFields = getSelectFields(builder, query.select, query.include, schema, relations, selectQuery, table);

      if (query.where) {
        selectQuery.where(getSelectFilters(builder, query.where, relations, selectQuery, table));
      }

      updateQuery.from(selectQuery.reference()).as('U');
      selectQuery.record(selectFields);

      allQueries.push(selectQuery);
    }
  }

  const postUpdateQueries = await preparePostUpdateRelations(builder, query.data, relations, updateQuery, table);

  allQueries.push(updateQuery, ...postUpdateQueries);

  if (query.where) {
    updateQuery.where(getSelectFilters(builder, query.where, relations, updateQuery, table));
  }

  if (query.select && (postUpdateQueries.length > 0 || !(updateQuery instanceof SqlSelectStatement))) {
    const [firstQuery] = allQueries;
    const firstResult = () => mergeSqlAlias('*', firstQuery.alias);

    allQueries.push(builder.select().from(firstQuery.reference()).rawColumn(firstResult));
  }

  if (options?.flag) {
    const resultQuery = allQueries[allQueries.length - 1];
    const flagColumn = `1 AS ${escapeSqlName(options.flag)}`;

    resultQuery.results?.rawColumn(flagColumn);
  }

  return allQueries;
};

export const getUpdateRecord = async (
  builder: SqlBuilder,
  data: SqlRecord,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  path: string
) => {
  const record: SqlRecord = {};

  for (const fieldKey in data) {
    const fieldValue = data[fieldKey];

    if (fieldValue === undefined) {
      continue;
    }

    const fieldPath = `${path}.${fieldKey}`;
    const fieldRelation = relations[fieldPath];

    if (fieldRelation) {
      if (!isSingleRelationData(fieldValue)) {
        throw new InvalidRelationFieldError(fieldPath);
      }

      const { sourceSchema, sourceIndex, sourceColumn, targetColumn } = fieldRelation;

      if (sourceIndex === Index.Primary) {
        const relationValue = fieldValue[targetColumn];

        // Will connect another relation.
        if (relationValue !== undefined) {
          const relationSchema = getTargetConnectionSchema(schema, fieldRelation);

          await validateFirstSchemaLevel(fieldValue, relationSchema, fieldPath);

          record[targetColumn] = relationValue;
          continue;
        }

        // Will update the active relation.
        if (!isEmptyObject(fieldValue)) {
          const relationSchema = getUpdatingSchema(sourceSchema);

          await validateFirstSchemaLevel(fieldValue, relationSchema, fieldPath);
        }

        continue;
      }

      const relationValue = fieldValue[sourceColumn];

      // Will connect another relation.
      if (relationValue !== undefined) {
        const relationSchema = getSourceConnectionSchema(sourceSchema, fieldRelation);

        await validateFirstSchemaLevel(fieldValue, relationSchema, fieldPath);

        record[sourceColumn] = relationValue;
        continue;
      }

      // Will update the active relation.
      if (!isEmptyObject(fieldValue)) {
        const relationSchema = getUpdatingSchema(sourceSchema);

        await validateFirstSchemaLevel(fieldValue, relationSchema, fieldPath);
      }

      continue;
    }

    const fieldSchema = getObjectSchemaProperty(schema, fieldKey);

    if (!fieldSchema) {
      continue;
    }

    if (!isAnyObject(fieldValue)) {
      record[fieldKey] = await getWithSchemaValidation(fieldValue, fieldSchema, fieldPath);
      continue;
    }

    if (isNumberSchema(fieldSchema)) {
      record[fieldKey] = await getAtomicOperationUpdate(builder, fieldKey, fieldValue, fieldSchema, fieldPath);
      continue;
    }

    if (isDynamicFieldSchema(fieldSchema)) {
      record[fieldKey] = await getWithSchemaValidation(fieldValue, fieldSchema, fieldPath);
      continue;
    }

    if (isObjectSchema(fieldSchema)) {
      record[fieldKey] = await getUpdateRecord(builder, fieldValue, fieldSchema, relations, fieldPath);
      continue;
    }

    throw new InvalidFieldSchemaError(fieldKey);
  }

  return record;
};

const preparePostUpdateRelations = async (
  builder: SqlBuilder,
  data: SqlRecord,
  relations: PgRelationRepositoryWithSchema,
  source: SqlSourceWithResults,
  table: string
) => {
  const allRelationQueries = [];

  for (const relationPath in relations) {
    const fieldRelation = relations[relationPath];

    if (fieldRelation.targetTable !== table) {
      continue;
    }

    const fieldKey = fieldRelation.targetAlias;
    const fieldValue = data[fieldKey];

    if (fieldValue === undefined) {
      continue;
    }

    const fieldPath = `${table}.${fieldKey}`;

    if (!isSingleRelationData(fieldValue)) {
      throw new InvalidRelationFieldError(fieldPath);
    }

    const { sourceColumn, sourceIndex, targetColumn } = fieldRelation;

    if (sourceIndex !== Index.Primary && fieldValue[sourceColumn] !== undefined) {
      continue;
    }

    if (sourceIndex === Index.Primary && fieldValue[targetColumn] !== undefined) {
      continue;
    }

    const relationUpdate = await getFullRelationTableUpdate(builder, relations, source, fieldValue, fieldRelation, fieldPath);

    if (relationUpdate) {
      allRelationQueries.push(relationUpdate);
    }
  }

  return allRelationQueries;
};

const getFullRelationTableUpdate = async (
  builder: SqlBuilder,
  relations: PgRelationRepositoryWithSchema,
  source: SqlSourceWithResults,
  fieldValue: AnyObject,
  fieldRelation: PgRelationWithSchema,
  fieldPath: string
) => {
  const targetColumn = fieldRelation.targetColumn;
  const targetValue = fieldValue[targetColumn];

  if (targetValue !== undefined || isEmptyObject(fieldValue)) {
    return undefined;
  }

  const { sourceTable, sourceColumn, sourceSchema } = fieldRelation;

  const record = await getUpdateRecord(builder, fieldValue, sourceSchema, relations, fieldPath);

  const relationQuery = builder
    .update(sourceSchema)
    .from(source.reference())
    .only(sourceTable)
    .record(record)
    .where({ [sourceColumn]: source.reference(targetColumn) })
    .as('T');

  const { results } = source;

  if (!results.has(targetColumn)) {
    results.column(targetColumn);
  }

  return relationQuery;
};

const getAtomicOperationUpdate = async (
  builder: SqlBuilder,
  fieldKey: string,
  fieldValue: AnyObject,
  fieldSchema: NumberSchema,
  fieldPath: string
) => {
  for (const operation in fieldValue) {
    const value = fieldValue[operation];

    if (value === undefined || value === null) {
      continue;
    }

    await validateFirstSchemaLevel(value, fieldSchema, fieldPath);

    switch (operation) {
      default:
        throw new InvalidAtomicOperation(`${fieldPath}.${fieldKey}`);

      case 'increment':
        return builder.rawOperation('+', value);

      case 'decrement':
        return builder.rawOperation('-', value);

      case 'multiply':
        return builder.rawOperation('*', value);

      case 'divide':
        return builder.rawOperation('/', value);
    }
  }

  return undefined;
};
