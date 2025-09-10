import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { Query } from '@ez4/database';
import type { PgRelationWithSchema, PgRelationRepositoryWithSchema } from '../types/repository';
import type { InternalTableMetadata } from '../types/table';

import type {
  SqlInsertStatement,
  SqlUpdateStatement,
  SqlSelectStatement,
  SqlSourceWithResults,
  SqlJsonColumnRecord,
  SqlBuilder,
  SqlRecord
} from '@ez4/pgsql';

import { isObjectSchema } from '@ez4/schema';
import { InvalidRelationFieldError, MissingFieldSchemaError } from '@ez4/pgclient';
import { isEmptyObject } from '@ez4/utils';
import { Index } from '@ez4/database';

import {
  getConnectionSchema,
  getTargetCreationSchema,
  getSourceCreationSchema,
  isMultipleRelationData,
  isSingleRelationData,
  isPrimaryConnection,
  isRelationalData
} from '../utils/relation';

import { getFormattedColumn } from '../utils/formats';
import { getWithSchemaValidation, validateRecordSchema } from '../utils/schema';
import { getDefaultSelectFields, getSelectFields } from './select';

type InsertRelationsCache = Record<string, PgRelationWithSchema & { relationQueries: (SqlInsertStatement | SqlUpdateStatement)[] }>;

type CombinedRelationsCache = Record<string, PgRelationWithSchema & { relationQueries?: (SqlInsertStatement | SqlUpdateStatement)[] }>;

export const prepareInsertQuery = async <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  builder: SqlBuilder,
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  query: Query.InsertOneInput<S, T>
) => {
  const preInsertQueriesMap = preparePreInsertRelations(builder, query.data, relations, table);

  const preInsertQueries = Object.values(preInsertQueriesMap)
    .map(({ relationQueries }) => relationQueries)
    .flat();

  const insertRecord = await getInsertRecord(query.data, schema, relations, preInsertQueriesMap, table);
  const insertQuery = builder.insert(schema).record(insertRecord).into(table).returning();

  if (preInsertQueries.length) {
    insertQuery.select(...preInsertQueries.map((query) => query.reference()));
  }

  const postInsertQueriesMap = preparePostInsertRelations(builder, query.data, relations, insertQuery, table);

  const postInsertQueries = Object.values(postInsertQueriesMap)
    .map(({ relationQueries }) => relationQueries)
    .flat();

  const allQueries: (SqlSelectStatement | SqlInsertStatement | SqlUpdateStatement)[] = [
    ...preInsertQueries,
    insertQuery,
    ...postInsertQueries
  ];

  if (query.select) {
    const allRelations = { ...relations, ...preInsertQueriesMap, ...postInsertQueriesMap };
    const selectQuery = builder.select().from(insertQuery.reference());

    const selectRecord = getInsertSelectFields(builder, query.select, schema, allRelations, insertQuery, selectQuery, table);

    selectQuery.record(selectRecord);
    allQueries.push(selectQuery);
  }

  return allQueries;
};

export const getInsertRecord = async (
  data: SqlRecord,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  relationsCache: InsertRelationsCache,
  path: string
) => {
  const allFields = new Set([...Object.keys(data), ...Object.keys(schema.properties)]);

  const record: SqlRecord = {};

  for (const fieldKey of allFields) {
    const fieldPath = `${path}.${fieldKey}`;
    const fieldRelation = relations[fieldPath];
    const fieldSchema = schema.properties[fieldKey];
    const fieldValue = data[fieldKey];

    if (!fieldRelation) {
      if (fieldSchema) {
        record[fieldKey] = await getWithSchemaValidation(fieldValue, fieldSchema, fieldPath);
      }

      continue;
    }

    if (fieldValue === undefined) {
      continue;
    }

    if (!isRelationalData(fieldValue) || !relationsCache[fieldPath]) {
      throw new InvalidRelationFieldError(fieldPath);
    }

    const { primaryColumn, relationQueries, sourceSchema, sourceIndex, sourceColumn, targetIndex, targetColumn } =
      relationsCache[fieldPath];

    if (!sourceIndex || sourceIndex === Index.Secondary) {
      if (!isMultipleRelationData(fieldValue)) {
        throw new InvalidRelationFieldError(fieldPath);
      }

      const allValidations = fieldValue.map((relationEntry) => {
        if (isEmptyObject(relationEntry)) {
          return Promise.resolve();
        }

        const { [primaryColumn]: relationValue, ...otherFields } = relationEntry;

        // Will connect an existing relation
        if (relationValue !== undefined && isEmptyObject(otherFields)) {
          const relationSchema = getConnectionSchema(sourceSchema, primaryColumn);

          return validateRecordSchema(relationEntry, relationSchema, fieldPath);
        }

        // Will create a new relations
        const relationSchema = getSourceCreationSchema(sourceSchema, fieldRelation);

        return validateRecordSchema(relationEntry, relationSchema, fieldPath);
      });

      await Promise.all(allValidations);

      allFields.delete(sourceColumn);
      continue;
    }

    if (!isSingleRelationData(fieldValue)) {
      throw new InvalidRelationFieldError(fieldPath);
    }

    if (isEmptyObject(fieldValue)) {
      continue;
    }

    const { [primaryColumn]: relationValue, ...otherFields } = fieldValue;

    allFields.delete(targetColumn);

    // Will connect an existing relation
    if (relationValue !== undefined && isEmptyObject(otherFields)) {
      const relationSchema = getConnectionSchema(sourceSchema, primaryColumn);

      await validateRecordSchema(fieldValue, relationSchema, fieldPath);

      record[targetColumn] = relationValue;
      continue;
    }

    //  Will post-create a relation
    if (targetIndex === Index.Primary) {
      const relationSchema = getSourceCreationSchema(sourceSchema, fieldRelation);

      await validateRecordSchema(fieldValue, relationSchema, fieldPath);
      continue;
    }

    // Has a pre-created relations
    const relationSchema = getTargetCreationSchema(sourceSchema, fieldRelation);
    const relationQuery = relationQueries[0];

    record[targetColumn] = relationQuery.reference(sourceColumn);

    await validateRecordSchema(fieldValue, relationSchema, fieldPath);
    continue;
  }

  return record;
};

const preparePreInsertRelations = (
  builder: SqlBuilder,
  data: Query.InsertDataInput<InternalTableMetadata>,
  relations: PgRelationRepositoryWithSchema,
  table: string
) => {
  const allQueries: InsertRelationsCache = {};

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

    if (!isRelationalData(fieldValue)) {
      throw new InvalidRelationFieldError(fieldPath);
    }

    const relationQueries: SqlInsertStatement[] = [];

    allQueries[relationPath] = {
      ...fieldRelation,
      relationQueries
    };

    const { primaryColumn, sourceTable, sourceColumn, sourceIndex, sourceSchema, targetIndex } = fieldRelation;

    if (!isEmptyObject(fieldValue) && isValidPreInsertion(sourceIndex, targetIndex) && !isPrimaryConnection(primaryColumn, fieldValue)) {
      const relationQuery = builder
        .insert(sourceSchema)
        .into(sourceTable)
        .record(fieldValue)
        .returning({
          [sourceColumn]: true
        });

      relationQueries.push(relationQuery);
    }
  }

  return allQueries;
};

const preparePostInsertRelations = (
  builder: SqlBuilder,
  data: Query.InsertDataInput<InternalTableMetadata>,
  relations: PgRelationRepositoryWithSchema,
  source: SqlSourceWithResults,
  table: string
) => {
  const allQueries: InsertRelationsCache = {};

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

    if (!isRelationalData(fieldValue)) {
      throw new InvalidRelationFieldError(fieldPath);
    }

    const { primaryColumn, sourceIndex, sourceTable, sourceColumn, sourceSchema, targetIndex, targetColumn } = fieldRelation;

    if (isValidPreInsertion(sourceIndex, targetIndex)) {
      continue;
    }

    const allFieldValues = isMultipleRelationData(fieldValue) ? fieldValue : [fieldValue];

    const relationQueries = [];

    for (const currentFieldValue of allFieldValues) {
      if (isEmptyObject(currentFieldValue)) {
        continue;
      }

      const { [primaryColumn]: relationValue, ...otherFields } = currentFieldValue;

      if (!results.has(targetColumn)) {
        results.column(targetColumn);
      }

      // Connect an existing relation
      if (relationValue !== undefined && isEmptyObject(otherFields)) {
        const relationQuery = builder
          .update(sourceSchema)
          .record({ [sourceColumn]: source.reference(targetColumn) })
          .where({ [primaryColumn]: relationValue })
          .from(source.reference())
          .only(sourceTable)
          .as('T');

        relationQueries.push(relationQuery);
        continue;
      }

      // Create a new relation
      const relationQuery = builder
        .insert(sourceSchema)
        .select(source.reference())
        .into(sourceTable)
        .record({
          ...currentFieldValue,
          [sourceColumn]: source.reference(targetColumn)
        });

      relationQueries.push(relationQuery);
    }

    allQueries[relationPath] = {
      ...fieldRelation,
      relationQueries
    };
  }

  return allQueries;
};

const getInsertSelectFields = (
  builder: SqlBuilder,
  fields: Query.StrictSelectInput<AnyObject, InternalTableMetadata>,
  schema: ObjectSchema,
  relations: CombinedRelationsCache,
  main: SqlInsertStatement | undefined,
  source: SqlSelectStatement,
  path: string,
  json?: boolean
) => {
  const allFields = isEmptyObject(fields) ? getDefaultSelectFields(schema) : fields;

  const output: SqlJsonColumnRecord = {};

  for (const fieldKey in allFields) {
    const fieldValue = allFields[fieldKey];

    if (!fieldValue) {
      continue;
    }

    const fieldPath = `${path}.${fieldKey}`;
    const fieldRelation = relations[fieldPath];

    if (fieldRelation) {
      const { relationQueries, sourceTable, sourceColumn, sourceIndex, targetColumn, sourceSchema } = fieldRelation;

      const relationFields = fieldValue === true ? getDefaultSelectFields(sourceSchema) : fieldValue;
      const relationQuery = builder.select(sourceSchema);

      // Connected relations
      if (!relationQueries?.length) {
        relationQuery.from(sourceTable).where({
          [sourceColumn]: source.reference(targetColumn)
        });

        if (main?.results && !main.results.has(targetColumn)) {
          main.results.column(targetColumn);
        }

        const relationRecord = getSelectFields(builder, relationFields, null, sourceSchema, relations, relationQuery, fieldPath, true);

        if (sourceIndex === Index.Primary || sourceIndex === Index.Unique) {
          relationQuery.objectColumn(relationRecord, { binary: true });
        } else {
          relationQuery.arrayColumn(relationRecord, { binary: true });
        }
      } else {
        // Inserted relations
        relationQuery.from(...relationQueries.map((query) => query.reference()));

        for (const relationFieldKey in relationFields) {
          for (const relationQuery of relationQueries) {
            const { results } = relationQuery.returning();

            if (!results.has(relationFieldKey)) {
              results.column(relationFieldKey);
            }
          }
        }

        const record = getInsertSelectFields(builder, relationFields, sourceSchema, relations, undefined, relationQuery, fieldPath, true);

        if (sourceIndex === Index.Primary || sourceIndex === Index.Unique) {
          relationQuery.objectColumn(record, { binary: true });
        } else {
          relationQuery.arrayColumn(record, { binary: true });
        }
      }

      output[fieldKey] = relationQuery;
      continue;
    }

    const fieldSchema = schema.properties[fieldKey];

    if (!fieldSchema) {
      throw new MissingFieldSchemaError(fieldPath);
    }

    if (main?.results && !main.results.has(fieldKey)) {
      main.results.column(fieldKey);
    }

    if (isObjectSchema(fieldSchema)) {
      output[fieldKey] = fieldValue;
      continue;
    }

    const fieldColumn = getFormattedColumn(fieldKey, fieldSchema, !json);

    if (fieldColumn instanceof Function) {
      output[fieldKey] = source.reference(fieldColumn);
    } else {
      output[fieldKey] = source.reference(fieldKey);
    }
  }

  return output;
};

const isValidPreInsertion = (sourceIndex: Index | undefined, targetIndex: Index | undefined) => {
  if (sourceIndex === Index.Primary || sourceIndex === Index.Unique) {
    return !targetIndex || targetIndex === Index.Secondary || targetIndex === Index.Unique;
  }

  return false;
};
