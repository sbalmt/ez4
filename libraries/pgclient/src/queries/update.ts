import type { SqlSourceWithResults, SqlRecord, SqlBuilder, SqlUpdateStatement } from '@ez4/pgsql';
import type { NumberSchema, ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { Query } from '@ez4/database';
import type { PgRelationRepositoryWithSchema } from '../types/repository';
import type { InternalTableMetadata } from '../types/table';

import { getObjectSchemaProperty, getOptionalSchema, isNumberSchema, isObjectSchema } from '@ez4/schema';
import { InvalidAtomicOperation, InvalidFieldSchemaError, InvalidRelationFieldError } from '@ez4/pgclient';
import { escapeSqlName, SqlSelectStatement } from '@ez4/pgsql';
import { isAnyObject, isEmptyObject } from '@ez4/utils';
import { Index } from '@ez4/database';

import { getWithSchemaValidation, isDynamicFieldSchema, validateRecordSchema } from '../utils/schema';
import { getConnectionSchema, isSingleRelationData } from '../utils/relation';
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

      updateQuery.record(selectFields);

      if (query.lock) {
        updateQuery.lock();
      }
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

    allQueries.push(
      builder
        .select()
        .columns(...Object.keys(query.select))
        .from(firstQuery.reference())
    );
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

      const { primaryColumn, sourceSchema, sourceIndex, targetColumn, targetIndex } = fieldRelation;

      const { [primaryColumn]: relationValue, ...otherFields } = fieldValue;

      // Will connect an existing relation
      if (relationValue !== undefined && isEmptyObject(otherFields)) {
        const relationSchema = getConnectionSchema(sourceSchema, primaryColumn);

        await validateRecordSchema(fieldValue, relationSchema, fieldPath);

        if (isValidSingleUpdate(sourceIndex, targetIndex)) {
          record[targetColumn] = relationValue;
        }

        continue;
      }

      // Will update an existing relation
      if (!isEmptyObject(fieldValue)) {
        const relationSchema = getOptionalSchema(sourceSchema);

        await validateRecordSchema(fieldValue, relationSchema, fieldPath);
      }
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
      record[fieldKey] = await getWithSchemaValidation(fieldValue, getOptionalSchema(fieldSchema), fieldPath);
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
  const allQueries = [];

  const { results } = source;

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

    if (isEmptyObject(fieldValue)) {
      continue;
    }

    const { primaryColumn, sourceIndex, sourceTable, sourceColumn, sourceSchema, targetIndex, targetColumn } = fieldRelation;

    const { [primaryColumn]: relationValue, ...otherFields } = fieldValue;

    const relationQuery = builder.update(sourceSchema).only(sourceTable).as('T');

    // Update existing relation
    if (relationValue === undefined || !isEmptyObject(otherFields)) {
      const fieldRecord = await getUpdateRecord(builder, fieldValue, sourceSchema, relations, fieldPath);

      if (!results.has(targetColumn)) {
        results.column(targetColumn);
      }

      relationQuery
        .where({ [sourceColumn]: source.reference(targetColumn) })
        .from(source.reference())
        .record(fieldRecord);

      allQueries.push(relationQuery);
      continue;
    }

    if (isValidSingleUpdate(sourceIndex, targetIndex)) {
      continue;
    }

    if (!results.has(targetColumn)) {
      results.column(targetColumn);
    }

    // Disconnect current relation
    if (relationValue === null) {
      relationQuery
        .from(source.reference())
        .where({ [sourceColumn]: source.reference(targetColumn) })
        .record({ [sourceColumn]: null });

      allQueries.push(relationQuery);
      continue;
    }

    // Remove prior association to avoid unique constraint errors
    if (sourceIndex == Index.Unique && targetIndex === Index.Primary) {
      const detachQuery = builder
        .update(sourceSchema)
        .record({ [sourceColumn]: null })
        .where({ [sourceColumn]: source.reference(targetColumn) })
        .returning([source.reference(targetColumn)])
        .from(source.reference())
        .only(sourceTable)
        .as('T');

      relationQuery
        .from(detachQuery.reference())
        .record({ [sourceColumn]: detachQuery.reference(targetColumn) })
        .where({ [primaryColumn]: relationValue });

      allQueries.push(detachQuery, relationQuery);
      continue;
    }

    relationQuery
      .from(source.reference())
      .record({ [sourceColumn]: source.reference(targetColumn) })
      .where({ [primaryColumn]: relationValue });

    allQueries.push(relationQuery);
  }

  return allQueries;
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

    await validateRecordSchema(value, fieldSchema, fieldPath);

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

const isValidSingleUpdate = (sourceIndex: Index | undefined, targetIndex: Index | undefined) => {
  return (
    ((sourceIndex === Index.Primary || sourceIndex === Index.Unique) && (!targetIndex || targetIndex === Index.Secondary)) ||
    (sourceIndex === Index.Primary && targetIndex === Index.Unique)
  );
};
