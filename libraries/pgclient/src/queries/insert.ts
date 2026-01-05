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
  getTargetCreationSchema,
  getSourceCreationSchema,
  getConnectionSchema,
  isMultipleRelationData,
  isSingleRelationData,
  isRelationalData
} from '../utils/relation';

import { getFormattedColumn } from '../utils/formats';
import { getWithSchemaValidation, validateRecordSchema } from '../utils/schema';
import { getDefaultSelectFields, getSelectFields } from './select';

type InsertRelationRepository = Record<string, PgRelationWithSchema & { relationQueries: (SqlInsertStatement | SqlUpdateStatement)[] }>;

type RelationRepository = Record<string, PgRelationWithSchema & { relationQueries?: (SqlInsertStatement | SqlUpdateStatement)[] }>;

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
  repository: InsertRelationRepository,
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

    if (!isRelationalData(fieldValue) || !repository[fieldPath]) {
      throw new InvalidRelationFieldError(fieldPath);
    }

    const { relationQueries, sourceIndex, sourceColumn, targetIndex, targetColumn } = repository[fieldPath];

    if (!sourceIndex || sourceIndex === Index.Secondary) {
      if (!isMultipleRelationData(fieldValue)) {
        throw new InvalidRelationFieldError(fieldPath);
      }

      const allValidations = fieldValue.map((relationEntry) => {
        if (isEmptyObject(relationEntry)) {
          return Promise.resolve();
        }

        const [relationValue, relationSchema] = getRelationValue(relationEntry, fieldRelation);

        if (relationValue !== undefined) {
          if (relationValue !== null) {
            return validateRecordSchema(relationEntry, relationSchema, fieldPath);
          }

          return Promise.resolve();
        }

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

    const [relationValue, relationSchema] = getRelationValue(fieldValue, fieldRelation);

    allFields.delete(targetColumn);

    if (relationValue !== undefined) {
      if (relationValue !== null) {
        await validateRecordSchema(fieldValue, relationSchema, fieldPath);

        if (targetIndex !== Index.Primary) {
          record[targetColumn] = relationValue;
        }
      }

      continue;
    }

    //  Will post-create relations
    if (relationSchema) {
      if (targetIndex === Index.Primary) {
        await validateRecordSchema(fieldValue, relationSchema, fieldPath);
        continue;
      }

      // Will pre-create relations
      record[targetColumn] = relationQueries[0].reference(sourceColumn);

      await validateRecordSchema(fieldValue, relationSchema, fieldPath);
    }
  }

  return record;
};

const preparePreInsertRelations = (
  builder: SqlBuilder,
  data: Query.InsertDataInput<InternalTableMetadata>,
  relations: PgRelationRepositoryWithSchema,
  table: string
) => {
  const allQueries: InsertRelationRepository = {};

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

    const relationQueries: (SqlInsertStatement | SqlUpdateStatement)[] = [];

    allQueries[relationPath] = {
      ...fieldRelation,
      relationQueries
    };

    const { sourceTable, sourceColumn, sourceSchema } = fieldRelation;

    const relationCreate = getPreRelationValue(fieldValue, fieldRelation);

    if (relationCreate) {
      const relationQuery = builder
        .insert(sourceSchema)
        .into(sourceTable)
        .record(relationCreate)
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
  const allQueries: InsertRelationRepository = {};

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

    const { sourceTable, sourceColumn, sourceSchema, targetColumn } = fieldRelation;

    const allFieldValues = isMultipleRelationData(fieldValue) ? fieldValue : [fieldValue];

    const relationQueries = [];

    for (const currentFieldValue of allFieldValues) {
      const [relationValue, relationColumn, relationCreate] = getPostRelationValue(currentFieldValue, fieldRelation);

      if (relationValue !== undefined) {
        if (relationValue !== null) {
          if (!results.has(targetColumn)) {
            results.column(targetColumn);
          }

          // Connect an existing relation
          const relationQuery = builder
            .update(sourceSchema)
            .from(source.reference())
            .record({ [sourceColumn]: source.reference(targetColumn) })
            .where({ [relationColumn]: relationValue })
            .only(sourceTable)
            .as('T');

          relationQueries.push(relationQuery);
        }

        continue;
      }

      if (relationCreate !== undefined) {
        if (!results.has(targetColumn)) {
          results.column(targetColumn);
        }

        // Create a new relation
        const relationQuery = builder
          .insert(sourceSchema)
          .select(source.reference())
          .into(sourceTable)
          .record({
            ...relationCreate,
            [sourceColumn]: source.reference(targetColumn)
          });

        relationQueries.push(relationQuery);
      }
    }

    if (relationQueries.length > 0) {
      allQueries[relationPath] = {
        ...fieldRelation,
        relationQueries
      };
    }
  }

  return allQueries;
};

const getInsertSelectFields = (
  builder: SqlBuilder,
  fields: Query.StrictSelectInput<AnyObject, InternalTableMetadata>,
  schema: ObjectSchema,
  relations: RelationRepository,
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

        const relationRecord = getSelectFields(builder, relationFields, null, sourceSchema, relations, relationQuery, sourceTable, true);

        if (sourceIndex === Index.Primary || sourceIndex === Index.Unique) {
          relationQuery.objectColumn(relationRecord, { binary: true });
        } else {
          relationQuery.arrayColumn(relationRecord, { binary: true });
        }

        output[fieldKey] = relationQuery;
        continue;
      }

      // Inserted relations
      if (relationQueries.length > 1) {
        relationQuery.from(builder.union(relationQueries.map((query) => builder.select().from(query.reference()))));
      } else {
        relationQuery.from(...relationQueries.map((query) => query.reference()));
      }

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

const getRelationValue = (fieldValue: AnyObject, fieldRelation: PgRelationWithSchema) => {
  const { primaryColumn, sourceColumn, sourceIndex, sourceSchema, targetIndex } = fieldRelation;

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

  // Will post-create relations
  if (targetIndex === Index.Primary || (targetIndex === Index.Unique && (!sourceIndex || sourceIndex === Index.Secondary))) {
    const relationSchema = getTargetCreationSchema(sourceSchema, sourceColumn);

    return [, relationSchema];
  }

  // Will pre-create relations
  const relationSchema = getSourceCreationSchema(sourceSchema, sourceColumn);

  return [, relationSchema];
};

const getPreRelationValue = (fieldValue: AnyObject, fieldRelation: PgRelationWithSchema) => {
  const { primaryColumn, sourceColumn, sourceIndex, targetIndex } = fieldRelation;

  const relationColumn = sourceIndex === Index.Primary || sourceIndex === Index.Unique ? sourceColumn : primaryColumn;

  const { [relationColumn]: _relationValue, ...otherFields } = fieldValue;

  // Will connect an existing relation
  if (isEmptyObject(otherFields)) {
    return undefined;
  }

  // Will post-create relations
  if (targetIndex === Index.Primary || (targetIndex === Index.Unique && (!sourceIndex || sourceIndex === Index.Secondary))) {
    return undefined;
  }

  // Will pre-create relations
  return fieldValue;
};

const getPostRelationValue = (fieldValue: AnyObject, fieldRelation: PgRelationWithSchema) => {
  const { primaryColumn, sourceColumn, sourceIndex, targetIndex } = fieldRelation;

  const relationColumn = sourceIndex === Index.Primary || sourceIndex === Index.Unique ? sourceColumn : primaryColumn;

  const { [relationColumn]: relationValue, ...otherFields } = fieldValue;

  // Will connect an existing relation
  if (isEmptyObject(otherFields)) {
    if (targetIndex === Index.Primary || !sourceIndex || sourceIndex === Index.Secondary) {
      return [relationValue, relationColumn];
    }

    return [];
  }

  // Will post-create relations
  if (targetIndex === Index.Primary || (targetIndex === Index.Unique && (!sourceIndex || sourceIndex === Index.Secondary))) {
    return [, , fieldValue];
  }

  // Will pre-create relations
  return [];
};
