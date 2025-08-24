import type { SqlInsertStatement, SqlSelectStatement, SqlSourceWithResults, SqlJsonColumnSchema, SqlBuilder, SqlRecord } from '@ez4/pgsql';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { Query } from '@ez4/database';
import type { RelationWithSchema, RepositoryRelationsWithSchema } from '../types/repository.js';
import type { InternalTableMetadata } from '../types/table.js';

import { InvalidRelationFieldError, MissingFieldSchemaError } from '@ez4/pgclient';
import { isObjectSchema } from '@ez4/schema';
import { isEmptyObject } from '@ez4/utils';
import { Index } from '@ez4/database';

import {
  isMultipleRelationData,
  isSingleRelationData,
  isRelationalData,
  getTargetCreationSchema,
  getTargetConnectionSchema,
  getSourceCreationSchema,
  getSourceConnectionSchema
} from '../utils/relation.js';

import { getWithSchemaValidation, validateAllSchemaLevels, validateFirstSchemaLevel } from '../utils/schema.js';
import { getDefaultSelectFields, getFieldColumn, getSelectFields } from './select.js';

type InsertRelationsCache = Record<string, InsertRelationEntry>;

type InsertRelationEntry = RelationWithSchema & {
  relationQueries: SqlInsertStatement[];
};

export const prepareInsertQuery = async <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.InsertOneInput<S, T>,
  builder: SqlBuilder
): Promise<[string, SqlParameter[]]> => {
  const preQueriesMap = preparePreInsertRelations(builder, query.data, relations, table);
  const preQueries = Object.values(preQueriesMap)
    .map(({ relationQueries }) => relationQueries)
    .flat();

  const insertRecord = await getInsertRecord(query.data, schema, relations, preQueriesMap, table);

  const insertQuery = builder
    .insert(schema)
    .select(...preQueries.map((query) => query.reference()))
    .record(insertRecord)
    .into(table)
    .returning();

  const postQueriesMap = preparePostInsertRelations(builder, query.data, relations, insertQuery, table);

  const postQueries = Object.values(postQueriesMap)
    .map(({ relationQueries }) => relationQueries)
    .flat();

  const allQueries: (SqlSelectStatement | SqlInsertStatement)[] = [...preQueries, insertQuery, ...postQueries];

  if (query.select) {
    const allRelations = { ...preQueriesMap, ...postQueriesMap };
    const selectQuery = builder.select(schema).from(insertQuery.reference());

    const selectRecord = getInsertSelectFields(builder, query.select, schema, allRelations, insertQuery, selectQuery, table);

    selectQuery.record(selectRecord);
    allQueries.push(selectQuery);
  }

  const [statement, variables] = builder.with(allQueries).build();

  return [statement, variables as SqlParameter[]];
};

const getInsertRecord = async (
  data: SqlRecord,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
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

    if (!isRelationalData(fieldValue) || !relationsCache[fieldKey]) {
      throw new InvalidRelationFieldError(fieldPath);
    }

    const { relationQueries, sourceSchema, sourceIndex, sourceColumn, targetColumn } = relationsCache[fieldKey];

    if (!sourceIndex || sourceIndex === Index.Secondary) {
      if (!isMultipleRelationData(fieldValue)) {
        throw new InvalidRelationFieldError(fieldPath);
      }

      const relationSchema = getSourceCreationSchema(sourceSchema, fieldRelation);

      const allValidations = fieldValue.map((relationValue) => {
        if (!isEmptyObject(relationValue)) {
          return validateAllSchemaLevels(relationValue, relationSchema, fieldPath);
        }

        return Promise.resolve();
      });

      await Promise.all(allValidations);

      allFields.delete(sourceColumn);
      continue;
    }

    if (!isSingleRelationData(fieldValue)) {
      throw new InvalidRelationFieldError(fieldPath);
    }

    if (sourceIndex === Index.Primary) {
      const relationValue = fieldValue[targetColumn];

      allFields.delete(targetColumn);

      // Will connect an existing relationship.
      if (relationValue !== undefined) {
        const relationSchema = getTargetConnectionSchema(schema, fieldRelation);

        await validateAllSchemaLevels(fieldValue, relationSchema, fieldPath);

        record[targetColumn] = relationValue;
        continue;
      }

      // Will create a new relationship.
      if (!isEmptyObject(fieldValue)) {
        const relationSchema = getTargetCreationSchema(sourceSchema, fieldRelation);
        const relationQuery = relationQueries[0];

        await validateAllSchemaLevels(fieldValue, relationSchema, fieldPath);

        record[targetColumn] = relationQuery.reference(sourceColumn);
      }

      continue;
    }

    if (sourceIndex === Index.Unique) {
      const relationValue = fieldValue[sourceColumn];

      allFields.delete(sourceColumn);

      // Will connect an existing relationship.
      if (relationValue !== undefined) {
        const relationSchema = getSourceConnectionSchema(sourceSchema, fieldRelation);

        await validateFirstSchemaLevel(fieldValue, relationSchema, fieldPath);

        record[sourceColumn] = relationValue;
        continue;
      }

      // Will create a new relationship.
      if (!isEmptyObject(fieldValue)) {
        const relationSchema = getSourceCreationSchema(sourceSchema, fieldRelation);

        await validateAllSchemaLevels(fieldValue, relationSchema, fieldPath);
      }
    }
  }

  return record;
};

const preparePreInsertRelations = (
  builder: SqlBuilder,
  data: Query.InsertDataInput<InternalTableMetadata>,
  relations: RepositoryRelationsWithSchema,
  path: string
) => {
  const allQueries: InsertRelationsCache = {};

  for (const relationPath in relations) {
    const fieldRelation = relations[relationPath];

    const fieldKey = fieldRelation.targetAlias;
    const fieldValue = data[fieldKey];

    if (fieldValue === undefined) {
      continue;
    }

    const fieldPath = `${path}.${fieldKey}`;

    if (!isRelationalData(fieldValue)) {
      throw new InvalidRelationFieldError(fieldPath);
    }

    const relationQueries: SqlInsertStatement[] = [];

    allQueries[fieldKey] = {
      ...fieldRelation,
      relationQueries
    };

    const sourceIndex = fieldRelation.sourceIndex;

    if (!isSingleRelationData(fieldValue) || isEmptyObject(fieldValue) || sourceIndex !== Index.Primary) {
      continue;
    }

    const { sourceTable, sourceColumn, sourceSchema, targetColumn } = fieldRelation;

    const relationValue = fieldValue[targetColumn];

    if (relationValue !== undefined) {
      continue;
    }

    const relationQuery = builder
      .insert(sourceSchema)
      .into(sourceTable)
      .record(fieldValue)
      .returning({
        [sourceColumn]: true
      });

    relationQueries.push(relationQuery);
  }

  return allQueries;
};

const preparePostInsertRelations = (
  builder: SqlBuilder,
  data: Query.InsertDataInput<InternalTableMetadata>,
  relations: RepositoryRelationsWithSchema,
  source: SqlSourceWithResults,
  path: string
) => {
  const allQueries: InsertRelationsCache = {};

  const { results } = source;

  for (const relationPath in relations) {
    const fieldRelation = relations[relationPath];

    const fieldKey = fieldRelation.targetAlias;
    const fieldValue = data[fieldKey];

    if (fieldValue === undefined) {
      continue;
    }

    const fieldPath = `${path}.${fieldKey}`;

    if (!isRelationalData(fieldValue)) {
      throw new InvalidRelationFieldError(fieldPath);
    }

    const { sourceIndex, sourceTable, sourceColumn, sourceSchema, targetColumn } = fieldRelation;

    if (fieldRelation.sourceIndex === Index.Primary) {
      continue;
    }

    const allFieldValues = isMultipleRelationData(fieldValue) ? fieldValue : [fieldValue];

    const relationQueries = [];

    for (const currentFieldValue of allFieldValues) {
      if (isEmptyObject(currentFieldValue)) {
        continue;
      }

      if (sourceIndex === Index.Unique) {
        const relationValue = currentFieldValue[sourceColumn];

        if (relationValue !== undefined) {
          continue;
        }
      }

      const relationQuery = builder
        .insert(sourceSchema)
        .select(source.reference())
        .into(sourceTable)
        .record({
          ...currentFieldValue,
          [sourceColumn]: source.reference(targetColumn)
        });

      if (!results.has(targetColumn)) {
        results.column(targetColumn);
      }

      relationQueries.push(relationQuery);
    }

    allQueries[fieldKey] = {
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
  relations: InsertRelationsCache,
  main: SqlInsertStatement | undefined,
  source: SqlSelectStatement,
  path: string,
  json?: boolean
) => {
  const allFields = isEmptyObject(fields) ? getDefaultSelectFields(schema) : fields;

  const output: SqlJsonColumnSchema = {};

  for (const fieldKey in allFields) {
    const fieldValue = allFields[fieldKey];

    if (!fieldValue) {
      continue;
    }

    const fieldRelation = relations[fieldKey];
    const fieldPath = `${path}.${fieldKey}`;

    if (fieldRelation) {
      const { relationQueries, sourceTable, sourceIndex, targetColumn, sourceColumn, sourceSchema } = fieldRelation;

      const relationFields = fieldValue === true ? getDefaultSelectFields(sourceSchema) : fieldValue;
      const relationQuery = builder.select(sourceSchema);

      // Connected relations
      if (!relationQueries.length) {
        const isUniqueIndex = sourceIndex === Index.Unique;

        const filterTarget = isUniqueIndex ? targetColumn : sourceColumn;
        const filterSource = isUniqueIndex ? sourceColumn : targetColumn;

        relationQuery.from(sourceTable).where({
          [filterTarget]: main?.reference(filterSource)
        });

        if (main?.results && !main.results.has(filterSource)) {
          main.results.column(filterSource);
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

    const fieldColumn = getFieldColumn(fieldKey, fieldSchema, !json);

    if (fieldColumn instanceof Function) {
      output[fieldKey] = source.reference(fieldColumn);
    } else {
      output[fieldKey] = source.reference(fieldKey);
    }
  }

  return output;
};
