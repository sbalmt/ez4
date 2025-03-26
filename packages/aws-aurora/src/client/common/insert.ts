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

  const preQueriesMap = preparePreRelations(table, query.data, relations, sql);
  const preQueries = Object.values(preQueriesMap)
    .map(({ relationQueries }) => relationQueries)
    .flat();

  const insertRecord = await getInsertRecord(table, query.data, schema, relations, preQueriesMap);

  const insertQuery = sql
    .insert(schema)
    .record(insertRecord)
    .select(...preQueries)
    .into(table)
    .returning();

  const postQueriesMap = preparePostRelations(table, query.data, relations, insertQuery, sql);
  const postQueries = Object.values(postQueriesMap)
    .map(({ relationQueries }) => relationQueries)
    .flat();

  const allQueries: (SqlSelectStatement | SqlInsertStatement)[] = [...preQueries, insertQuery, ...postQueries];

  if (query.select) {
    const allRelations = { ...preQueriesMap, ...postQueriesMap };
    const selectQuery = sql.select(schema).from(insertQuery);

    const selectRecord = getInsertSelectFields(table, query.select, schema, allRelations, insertQuery, selectQuery, sql);

    selectQuery.record(selectRecord);
    allQueries.push(selectQuery);
  }

  const [statement, variables] = sql.with(allQueries, 'R').build();

  return [statement, variables as SqlParameter[]];
};

const getInsertRecord = async (
  table: string,
  data: SqlRecord,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  relationsCache: InsertRelationsCache
) => {
  const record: SqlRecord = {};

  for (const fieldKey in data) {
    const fieldRelation = relations[fieldKey];
    const fieldSchema = schema.properties[fieldKey];
    const fieldValue = data[fieldKey];

    if (!fieldRelation) {
      await validateAllSchemaLevels(table, fieldValue, fieldSchema);

      record[fieldKey] = fieldValue;
      continue;
    }

    if (!isRelationalData(fieldValue) || !relationsCache[fieldKey]) {
      throw new InvalidRelationFieldError(table, fieldKey);
    }

    const { relationQueries, sourceSchema, sourceIndex, sourceColumn, targetColumn } = relationsCache[fieldKey];

    if (!sourceIndex || sourceIndex === Index.Secondary) {
      if (!isMultipleRelationData(fieldValue)) {
        throw new InvalidRelationFieldError(table, fieldKey);
      }

      await Promise.all(
        fieldValue.map((current) => {
          return validateAllSchemaLevels(table, current, sourceSchema);
        })
      );

      continue;
    }

    if (!isSingleRelationData(fieldValue)) {
      throw new InvalidRelationFieldError(table, fieldKey);
    }

    if (sourceIndex === Index.Primary) {
      const relationValue = fieldValue[targetColumn];

      if (!isSkippableData(relationValue)) {
        const relationSchema = schema.properties[targetColumn];

        await validateFirstSchemaLevel(table, relationValue, relationSchema);

        record[targetColumn] = relationValue;
        continue;
      }

      await validateAllSchemaLevels(table, fieldValue, sourceSchema);

      const [relationQuery] = relationQueries;

      record[targetColumn] = relationQuery.reference(sourceColumn);
      continue;
    }

    if (sourceIndex === Index.Unique) {
      const relationValue = fieldValue[sourceColumn];

      if (!isSkippableData(relationValue)) {
        const relationSchema = sourceSchema.properties[sourceColumn];

        await validateFirstSchemaLevel(table, relationValue, relationSchema);

        record[sourceColumn] = relationValue;
        continue;
      }

      await validateAllSchemaLevels(table, fieldValue, sourceSchema);
    }
  }

  return record;
};

const preparePreRelations = (table: string, data: SqlRecord, relations: RepositoryRelationsWithSchema, sql: SqlBuilder) => {
  const allQueries: InsertRelationsCache = {};

  for (const relationAlias in relations) {
    const fieldRelation = relations[relationAlias];
    const fieldValue = data[relationAlias];

    if (!fieldRelation || isSkippableData(fieldValue)) {
      continue;
    }

    if (!isRelationalData(fieldValue)) {
      throw new InvalidRelationFieldError(table, relationAlias);
    }

    const relationQueries: SqlInsertStatement[] = [];

    allQueries[relationAlias] = {
      ...fieldRelation,
      relationQueries
    };

    const { sourceIndex } = fieldRelation;

    if (isSingleRelationData(fieldValue) && sourceIndex === Index.Primary) {
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
  }

  return allQueries;
};

const preparePostRelations = (
  table: string,
  data: SqlRecord,
  relations: RepositoryRelationsWithSchema,
  source: SqlSourceWithResults,
  sql: SqlBuilder
) => {
  const allQueries: InsertRelationsCache = {};

  const { results } = source;

  for (const relationAlias in relations) {
    const fieldRelation = relations[relationAlias];
    const fieldValue = data[relationAlias];

    if (!fieldRelation || isSkippableData(fieldValue)) {
      continue;
    }

    if (!isRelationalData(fieldValue)) {
      throw new InvalidRelationFieldError(table, relationAlias);
    }

    const { sourceIndex } = fieldRelation;

    if (sourceIndex === Index.Primary) {
      continue;
    }

    const { sourceTable, sourceColumn, sourceSchema, targetColumn } = fieldRelation;

    const allFieldValues = isMultipleRelationData(fieldValue) ? fieldValue : [fieldValue];

    const relationQueries = [];

    for (const currentValue of allFieldValues) {
      if (sourceIndex === Index.Unique) {
        const relationValue = currentValue[sourceColumn];

        if (!isSkippableData(relationValue)) {
          continue;
        }
      }

      const relationQuery = sql
        .insert(sourceSchema)
        .into(sourceTable)
        .select(source)
        .record({
          ...currentValue,
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
  table: string,
  fields: Query.StrictSelectInput<T, S, R>,
  schema: ObjectSchema,
  relations: InsertRelationsCache,
  main: SqlInsertStatement | undefined,
  source: SqlSelectStatement,
  sql: SqlBuilder,
  json?: boolean
) => {
  const allFields = isEmptyObject(fields) ? getDefaultSelectFields(schema) : fields;

  const output: SqlJsonColumnSchema = {};

  for (const fieldKey in allFields) {
    const fieldValue = allFields[fieldKey];

    if (!fieldValue) {
      continue;
    }

    const relationSource = relations[fieldKey];

    if (relationSource) {
      const { relationQueries, sourceTable, sourceIndex, targetColumn, sourceColumn, sourceSchema } = relationSource;

      const relationFields = fieldValue === true ? getDefaultSelectFields(sourceSchema) : fieldValue;

      const relationQuery = sql.select(sourceSchema);

      // Connected relations
      if (!relationQueries.length) {
        const relationFilter =
          sourceIndex === Index.Unique
            ? { [sourceColumn]: main?.reference(targetColumn) }
            : { [targetColumn]: main?.reference(sourceColumn) };

        relationQuery.from(sourceTable).where(relationFilter);

        const relationRecord = getSelectFields(table, relationFields, {}, sourceSchema, relations, relationQuery, sql, true);

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

        const relationRecord = getInsertSelectFields(table, relationFields, sourceSchema, relations, undefined, relationQuery, sql, true);

        if (sourceIndex === Index.Primary || sourceIndex === Index.Unique) {
          relationQuery.objectColumn(relationRecord);
        } else {
          relationQuery.arrayColumn(relationRecord);
        }
      }

      output[fieldKey] = relationQuery;

      continue;
    }

    const fieldSchema = schema.properties[fieldKey];

    if (!fieldSchema) {
      throw new MissingFieldSchemaError(fieldKey);
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
