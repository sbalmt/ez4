import type { SqlInsertStatement, SqlSelectStatement, SqlSourceWithResults, SqlJsonColumnSchema, SqlBuilder, SqlRecord } from '@ez4/pgsql';
import type { Database, RelationMetadata, Query } from '@ez4/database';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { RelationWithSchema, RepositoryRelationsWithSchema } from '../../types/repository.js';

import { isObjectSchema } from '@ez4/schema';
import { isEmptyObject } from '@ez4/utils';
import { Index } from '@ez4/database';

import { isMultipleRelationData, isSingleRelationData, isRelationalData } from './relation.js';
import { getDefaultSelectFields, getFieldColumn, getSelectFields } from './select.js';
import { InvalidRelationFieldError, MissingFieldSchemaError } from './errors.js';
import { validateAllSchemaLevels, validateFirstSchemaLevel } from './schema.js';
import { createQueryBuilder } from './builder.js';
import { isSkippableData } from './data.js';

type InsertRelationsCache = Record<string, InsertRelationEntry>;

type InsertRelationEntry = RelationWithSchema & {
  relationQueries: SqlInsertStatement[];
};

export const prepareInsertQuery = async <T extends Database.Schema, S extends Query.SelectInput<T, R>, R extends RelationMetadata>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.InsertOneInput<T, S, R>
): Promise<[string, SqlParameter[]]> => {
  const sql = createQueryBuilder();

  const preQueriesMap = preparePreInsertRelations(sql, query.data, relations, table);
  const preQueries = Object.values(preQueriesMap)
    .map(({ relationQueries }) => relationQueries)
    .flat();

  const insertRecord = await getInsertRecord(query.data, schema, relations, preQueriesMap, table);

  const insertQuery = sql
    .insert(schema)
    .record(insertRecord)
    .select(...preQueries)
    .into(table)
    .returning();

  const postQueriesMap = preparePostInsertRelations(sql, query.data, relations, insertQuery, table);
  const postQueries = Object.values(postQueriesMap)
    .map(({ relationQueries }) => relationQueries)
    .flat();

  const allQueries: (SqlSelectStatement | SqlInsertStatement)[] = [...preQueries, insertQuery, ...postQueries];

  if (query.select) {
    const allRelations = { ...preQueriesMap, ...postQueriesMap };
    const selectQuery = sql.select(schema).from(insertQuery);

    const selectRecord = getInsertSelectFields(sql, query.select, schema, allRelations, insertQuery, selectQuery, table);

    selectQuery.record(selectRecord);
    allQueries.push(selectQuery);
  }

  const [statement, variables] = sql.with(allQueries, 'R').build();

  return [statement, variables as SqlParameter[]];
};

const getInsertRecord = async (
  data: SqlRecord,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  relationsCache: InsertRelationsCache,
  path: string
) => {
  const record: SqlRecord = {};

  for (const fieldKey in data) {
    const fieldRelation = relations[fieldKey];
    const fieldSchema = schema.properties[fieldKey];
    const fieldPath = `${path}.${fieldKey}`;
    const fieldValue = data[fieldKey];

    if (!fieldRelation) {
      await validateAllSchemaLevels(fieldValue, fieldSchema, fieldPath);

      record[fieldKey] = fieldValue;
      continue;
    }

    if (isSkippableData(fieldValue)) {
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

      await Promise.all(fieldValue.map((current) => validateAllSchemaLevels(current, sourceSchema, fieldPath)));
      continue;
    }

    if (!isSingleRelationData(fieldValue)) {
      throw new InvalidRelationFieldError(fieldPath);
    }

    if (sourceIndex === Index.Primary) {
      const relationValue = fieldValue[targetColumn];

      if (!isSkippableData(relationValue)) {
        const relationSchema = schema.properties[targetColumn];
        const relationPath = `${path}.${targetColumn}`;

        await validateFirstSchemaLevel(relationValue, relationSchema, relationPath);

        record[targetColumn] = relationValue;
        continue;
      }

      if (!isEmptyObject(fieldValue)) {
        await validateAllSchemaLevels(fieldValue, sourceSchema, fieldPath);

        const [relationQuery] = relationQueries;

        record[targetColumn] = relationQuery.reference(sourceColumn);
      }

      continue;
    }

    if (sourceIndex === Index.Unique) {
      const relationValue = fieldValue[sourceColumn];

      if (!isSkippableData(relationValue)) {
        const relationSchema = sourceSchema.properties[sourceColumn];
        const relationPath = `${path}.${sourceColumn}`;

        await validateFirstSchemaLevel(relationValue, relationSchema, relationPath);

        record[sourceColumn] = relationValue;
        continue;
      }

      if (!isEmptyObject(fieldValue)) {
        await validateAllSchemaLevels(fieldValue, sourceSchema, fieldPath);
      }
    }
  }

  return record;
};

const preparePreInsertRelations = (sql: SqlBuilder, data: SqlRecord, relations: RepositoryRelationsWithSchema, path: string) => {
  const allQueries: InsertRelationsCache = {};

  for (const relationAlias in relations) {
    const fieldRelation = relations[relationAlias];
    const fieldValue = data[relationAlias];

    if (isSkippableData(fieldValue)) {
      continue;
    }

    const fieldPath = `${path}.${relationAlias}`;

    if (!isRelationalData(fieldValue)) {
      throw new InvalidRelationFieldError(fieldPath);
    }

    const relationQueries: SqlInsertStatement[] = [];

    allQueries[relationAlias] = {
      ...fieldRelation,
      relationQueries
    };

    const sourceIndex = fieldRelation.sourceIndex;

    if (!isSingleRelationData(fieldValue) || isEmptyObject(fieldValue) || sourceIndex !== Index.Primary) {
      continue;
    }

    const { sourceTable, sourceColumn, sourceSchema, targetColumn } = fieldRelation;

    const relationValue = fieldValue[targetColumn];

    if (!isSkippableData(relationValue)) {
      continue;
    }

    const relationQuery = sql
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
  sql: SqlBuilder,
  data: SqlRecord,
  relations: RepositoryRelationsWithSchema,
  source: SqlSourceWithResults,
  path: string
) => {
  const allQueries: InsertRelationsCache = {};

  const { results } = source;

  for (const relationAlias in relations) {
    const fieldRelation = relations[relationAlias];
    const fieldValue = data[relationAlias];

    if (isSkippableData(fieldValue)) {
      continue;
    }

    const fieldPath = `${path}.${relationAlias}`;

    if (!isRelationalData(fieldValue)) {
      throw new InvalidRelationFieldError(fieldPath);
    }

    const { sourceIndex } = fieldRelation;

    if (sourceIndex === Index.Primary) {
      continue;
    }

    const { sourceTable, sourceColumn, sourceSchema, targetColumn } = fieldRelation;

    const allFieldValues = isMultipleRelationData(fieldValue) ? fieldValue : [fieldValue];

    const relationQueries = [];

    for (const currentFieldValue of allFieldValues) {
      if (isEmptyObject(currentFieldValue)) {
        continue;
      }

      if (sourceIndex === Index.Unique) {
        const relationValue = currentFieldValue[sourceColumn];

        if (!isSkippableData(relationValue)) {
          continue;
        }
      }

      const relationQuery = sql
        .insert(sourceSchema)
        .into(sourceTable)
        .select(source)
        .record({
          ...currentFieldValue,
          [sourceColumn]: source.reference(targetColumn)
        });

      if (!results.has(targetColumn)) {
        results.column(targetColumn);
      }

      relationQueries.push(relationQuery);
    }

    allQueries[relationAlias] = {
      ...fieldRelation,
      relationQueries
    };
  }

  return allQueries;
};

const getInsertSelectFields = <T extends Database.Schema, S extends AnyObject, R extends RelationMetadata>(
  sql: SqlBuilder,
  fields: Query.StrictSelectInput<T, S, R>,
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

      const relationQuery = sql.select(sourceSchema);

      // Connected relations
      if (!relationQueries.length) {
        const relationFilter =
          sourceIndex === Index.Unique
            ? { [sourceColumn]: main?.reference(targetColumn) }
            : { [targetColumn]: main?.reference(sourceColumn) };

        relationQuery.from(sourceTable).where(relationFilter);

        const relationRecord = getSelectFields(sql, relationFields, {}, sourceSchema, relations, relationQuery, fieldPath, true);

        if (sourceIndex === Index.Primary || sourceIndex === Index.Unique) {
          relationQuery.objectColumn(relationRecord);
        } else {
          relationQuery.arrayColumn(relationRecord);
        }
      } else {
        // Inserted relations
        relationQuery.from(...relationQueries);

        for (const relationFieldKey in relationFields) {
          for (const relationQuery of relationQueries) {
            const { results } = relationQuery.returning();

            if (!results.has(relationFieldKey)) {
              results.column(relationFieldKey);
            }
          }
        }

        const record = getInsertSelectFields(sql, relationFields, sourceSchema, relations, undefined, relationQuery, fieldPath, true);

        if (sourceIndex === Index.Primary || sourceIndex === Index.Unique) {
          relationQuery.objectColumn(record);
        } else {
          relationQuery.arrayColumn(record);
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
