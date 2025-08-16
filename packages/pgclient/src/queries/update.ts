import type { SqlSourceWithResults, SqlRecord, SqlBuilder, SqlSelectStatement, SqlUpdateStatement } from '@ez4/pgsql';
import type { NumberSchema, ObjectSchema } from '@ez4/schema';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { AnyObject } from '@ez4/utils';
import type { Query } from '@ez4/database';
import type { RelationWithSchema, RepositoryRelationsWithSchema } from '../types/repository.js';
import type { InternalTableMetadata } from '../types/table.js';

import { getObjectSchemaProperty, isNumberSchema, isObjectSchema } from '@ez4/schema';
import { InvalidAtomicOperation, InvalidFieldSchemaError, InvalidRelationFieldError } from '@ez4/pgclient';
import { isAnyObject, isEmptyObject } from '@ez4/utils';
import { Index } from '@ez4/database';

import { getWithSchemaValidation, isDynamicFieldSchema, validateFirstSchemaLevel } from '../utils/schema.js';
import { getSourceConnectionSchema, getTargetConnectionSchema, getUpdatingSchema, isSingleRelationData } from '../utils/relation.js';
import { getSelectFields, getSelectFilters } from './select.js';

export const prepareUpdateQuery = async <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.UpdateOneInput<S, T> | Query.UpdateManyInput<S, T>,
  builder: SqlBuilder
): Promise<[string, SqlParameter[]]> => {
  const updateRecord = await getUpdateRecord(builder, query.data, schema, relations, table);

  const updateQuery = !isEmptyObject(updateRecord)
    ? builder.update(schema).only(table).record(updateRecord).returning()
    : builder.select(schema).from(table);

  const postUpdateQueries = await preparePostUpdateRelations(builder, query.data, relations, updateQuery, table);

  const allQueries: (SqlSelectStatement | SqlUpdateStatement)[] = [updateQuery, ...postUpdateQueries];

  if (query.where) {
    updateQuery.where(getSelectFilters(builder, query.where, relations, updateQuery));
  }

  if (query.select) {
    if (!postUpdateQueries.length) {
      const selectRecord = getSelectFields(builder, query.select, query.include, schema, relations, updateQuery, table);

      updateQuery.results.record(selectRecord);
    } else {
      const selectQuery = builder.select(schema).from(table);
      const selectFields = getSelectFields(builder, query.select, query.include, schema, relations, updateQuery, table);

      selectQuery.record(selectFields);
      allQueries.push(selectQuery);
    }
  }

  const [statement, variables] = builder.with(allQueries, 'R').build();

  return [statement, variables as SqlParameter[]];
};

const getUpdateRecord = async (
  builder: SqlBuilder,
  data: SqlRecord,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  path: string
) => {
  const record: SqlRecord = {};

  for (const fieldName in data) {
    const fieldValue = data[fieldName];

    if (fieldValue === undefined) {
      continue;
    }

    const fieldRelation = relations[fieldName];
    const fieldPath = `${path}.${fieldName}`;

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

    const fieldSchema = getObjectSchemaProperty(schema, fieldName);

    if (!fieldSchema) {
      continue;
    }

    if (!isAnyObject(fieldValue)) {
      record[fieldName] = await getWithSchemaValidation(fieldValue, fieldSchema, fieldPath);
      continue;
    }

    if (isNumberSchema(fieldSchema)) {
      record[fieldName] = await getAtomicOperationUpdate(builder, fieldName, fieldValue, fieldSchema, fieldPath);
      continue;
    }

    if (isDynamicFieldSchema(fieldSchema)) {
      record[fieldName] = await getWithSchemaValidation(fieldValue, fieldSchema, fieldPath);
      continue;
    }

    if (isObjectSchema(fieldSchema)) {
      record[fieldName] = await getUpdateRecord(builder, fieldValue, fieldSchema, relations, fieldPath);
      continue;
    }

    throw new InvalidFieldSchemaError(fieldName);
  }

  return record;
};

const preparePostUpdateRelations = async (
  builder: SqlBuilder,
  data: SqlRecord,
  relations: RepositoryRelationsWithSchema,
  source: SqlSourceWithResults,
  path: string
) => {
  const allRelationQueries = [];

  for (const relationAlias in relations) {
    const fieldRelation = relations[relationAlias];
    const fieldValue = data[relationAlias];

    if (fieldValue === undefined) {
      continue;
    }

    const fieldPath = `${path}.${relationAlias}`;

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
  relations: RepositoryRelationsWithSchema,
  source: SqlSourceWithResults,
  fieldValue: AnyObject,
  fieldRelation: RelationWithSchema,
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
