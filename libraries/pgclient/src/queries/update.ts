import type { SqlSourceWithResults, SqlRecord, SqlBuilder, SqlUpdateStatement } from '@ez4/pgsql';
import type { NumberSchema, ObjectSchema, UnionSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { Query } from '@ez4/database';
import type { PgRelationRepositoryWithSchema, PgRelationWithSchema } from '../types/repository';
import type { InternalTableMetadata } from '../types/table';

import { InvalidAtomicOperation, InvalidFieldSchemaError, InvalidRelationFieldError } from '@ez4/pgclient';
import { getOptionalSchema, getSchemaProperty, isNumberSchema, isObjectSchema, isUnionSchema } from '@ez4/schema';
import { escapeSqlName, SqlSelectStatement } from '@ez4/pgsql';
import { isAnyObject, isEmptyObject } from '@ez4/utils';
import { Index } from '@ez4/database';

import { getConnectionSchema, isSingleRelationData } from '../utils/relation';
import { getWithSchemaValidation, isDynamicFieldSchema, validateRecordSchema } from '../utils/schema';
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
  schema: ObjectSchema | UnionSchema,
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

      const [relationValue, relationSchema] = getRelationValue(fieldValue, fieldRelation);

      // Will connect an existing relation
      if (relationValue !== undefined) {
        const { sourceIndex, targetColumn, targetIndex } = fieldRelation;

        await validateRecordSchema(fieldValue, relationSchema, fieldPath);

        if (isRelationHolder(sourceIndex, targetIndex)) {
          record[targetColumn] = relationValue;
        }

        continue;
      }

      // Will update an existing relation
      if (relationSchema) {
        await validateRecordSchema(fieldValue, relationSchema, fieldPath);
      }
    }

    const fieldSchema = getSchemaProperty(schema, fieldKey);

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

    if (isObjectSchema(fieldSchema) || isUnionSchema(fieldSchema)) {
      record[fieldKey] = await getUpdateRecord(builder, fieldValue, getOptionalSchema(fieldSchema), relations, fieldPath);
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

    const { sourceTable, sourceIndex, sourceColumn, sourceSchema, targetColumn } = fieldRelation;

    const [relationValue, relationColumn, relationUpdate] = getPostRelationValue(fieldValue, fieldRelation);

    // Connect an existing relation
    if (relationValue !== undefined) {
      const relationQuery = builder.update(sourceSchema).from(source.reference()).only(sourceTable).as('T');

      // Disconnect relation
      if (relationValue === null) {
        if (!results.has(targetColumn)) {
          results.column(targetColumn);
        }

        relationQuery.where({ [sourceColumn]: source.reference(targetColumn) });
        relationQuery.record({ [sourceColumn]: relationValue });

        allQueries.push(relationQuery);
        continue;
      }

      relationQuery.where({ [relationColumn]: relationValue });

      // Disconnect and Reconnect relation
      if (sourceIndex === Index.Unique) {
        if (!results.has(targetColumn)) {
          results.column(targetColumn);
        }

        const detachQuery = builder
          .update(sourceSchema)
          .record({ [sourceColumn]: null })
          .where({ [sourceColumn]: source.reference(targetColumn) })
          .returning([source.reference(targetColumn)])
          .from(source.reference())
          .only(sourceTable)
          .as('T');

        relationQuery.record({ [sourceColumn]: detachQuery.reference(targetColumn) });
        relationQuery.from(detachQuery.reference());

        allQueries.push(detachQuery, relationQuery);
        continue;
      }

      // Connect relation
      if (!results.has(targetColumn)) {
        results.column(targetColumn);
      }

      relationQuery.record({ [sourceColumn]: source.reference(targetColumn) });

      allQueries.push(relationQuery);
      continue;
    }

    // Update an existing relation
    if (relationUpdate !== undefined) {
      if (!results.has(targetColumn)) {
        results.column(targetColumn);
      }

      const relationQuery = builder
        .update(sourceSchema)
        .from(source.reference())
        .where({ [sourceColumn]: source.reference(targetColumn) })
        .record(relationUpdate)
        .only(sourceTable)
        .as('T');

      allQueries.push(relationQuery);
    }
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

const isRelationHolder = (sourceIndex: Index | undefined, targetIndex: Index | undefined) => {
  return sourceIndex === Index.Primary || (sourceIndex === Index.Unique && (!targetIndex || targetIndex === Index.Secondary));
};

const getRelationValue = (fieldValue: AnyObject, fieldRelation: PgRelationWithSchema) => {
  const { primaryColumn, sourceColumn, sourceIndex, sourceSchema } = fieldRelation;

  const relationColumn = sourceIndex === Index.Primary || sourceIndex === Index.Unique ? sourceColumn : primaryColumn;

  const { [relationColumn]: relationValue, ...otherFields } = fieldValue;

  // Will connect an existing relation
  if (isEmptyObject(otherFields)) {
    if (relationValue !== undefined) {
      const relationSchema = getConnectionSchema(sourceSchema, relationColumn);

      return [relationValue, relationSchema];
    }

    return [];
  }

  // Will update an existing relation
  const relationSchema = getOptionalSchema(sourceSchema);

  return [, relationSchema];
};

const getPostRelationValue = (fieldValue: AnyObject, fieldRelation: PgRelationWithSchema) => {
  const { primaryColumn, sourceColumn, sourceIndex, targetIndex } = fieldRelation;

  const relationColumn = sourceIndex === Index.Primary || sourceIndex === Index.Unique ? sourceColumn : primaryColumn;

  const { [relationColumn]: relationValue, ...otherFields } = fieldValue;

  // Will connect an existing relation
  if (isEmptyObject(otherFields)) {
    if (!isRelationHolder(sourceIndex, targetIndex)) {
      return [relationValue, relationColumn];
    }

    return [];
  }

  // Will post-update relations
  return [, , fieldValue];
};
