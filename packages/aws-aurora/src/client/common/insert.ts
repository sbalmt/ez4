import type { SqlInsertStatement, SqlSelectStatement, SqlSourceWithResults, SqlJsonColumnSchema, SqlBuilder, SqlRecord } from '@ez4/pgsql';
import type { Database, RelationMetadata, Query } from '@ez4/database';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { isObjectSchema } from '@ez4/schema';
import { isEmptyObject } from '@ez4/utils';
import { Index } from '@ez4/database';

import { isMultipleRelationData, isSingleRelationData, isRelationalData, isSkippableData } from './data.js';
import { InvalidRelationFieldError, MissingFieldSchemaError } from './errors.js';
import { getDefaultSelectFields, getFieldColumn, getSelectFields } from './select.js';
import { createQueryBuilder } from './builder.js';

type InsertRelationsCache = Record<string, InsertRelationEntry>;

type InsertRelationEntry = {
  relationQueries: SqlInsertStatement[];
  sourceSchema: ObjectSchema;
  targetColumn: string;
  sourceColumn: string;
  sourceIndex?: Index;
  sourceTable: string;
  sourceAlias: string;
};

export const prepareInsertQuery = <T extends Database.Schema, S extends Query.SelectInput<T, R>, R extends RelationMetadata>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.InsertOneInput<T, S, R>
): [string, SqlParameter[]] => {
  const sql = createQueryBuilder();

  const preQueriesMap = preparePreRelations(query.data, relations, sql);
  const preQueries = Object.values(preQueriesMap)
    .map(({ relationQueries }) => relationQueries)
    .flat();

  const insertQuery = sql
    .insert(schema)
    .record(getInsertRecord(query.data, relations, preQueriesMap))
    .select(...preQueries)
    .into(table)
    .returning();

  const postQueriesMap = preparePostRelations(query.data, relations, insertQuery, sql);
  const postQueries = Object.values(postQueriesMap)
    .map(({ relationQueries }) => relationQueries)
    .flat();

  const allQueries: (SqlSelectStatement | SqlInsertStatement)[] = [...preQueries, insertQuery, ...postQueries];

  if (query.select) {
    const allRelations = { ...preQueriesMap, ...postQueriesMap };

    const selectQuery = sql.select(schema).from(insertQuery);

    const selectRecord = getInsertSelectFields(query.select, schema, allRelations, insertQuery, selectQuery, sql);

    selectQuery.record(selectRecord);

    allQueries.push(selectQuery);
  }

  const [statement, variables] = sql.with(allQueries, 'R').build();

  return [statement, variables as SqlParameter[]];
};

const getInsertRecord = (data: SqlRecord, relations: RepositoryRelationsWithSchema, relationsCache: InsertRelationsCache) => {
  const record: SqlRecord = {};

  for (const fieldKey in data) {
    const fieldValue = data[fieldKey];

    if (isSkippableData(fieldValue)) {
      continue;
    }

    const relationData = relations[fieldKey];

    if (!relationData) {
      record[fieldKey] = fieldValue;
      continue;
    }

    if (!isRelationalData(fieldValue)) {
      throw new InvalidRelationFieldError(fieldKey);
    }

    if (!isSingleRelationData(fieldValue) || !relationsCache[fieldKey]) {
      continue;
    }

    const { relationQueries, sourceColumn, sourceIndex, targetColumn } = relationsCache[fieldKey];

    const [relationQuery] = relationQueries;

    if (sourceIndex === Index.Primary) {
      const relationId = fieldValue[targetColumn];

      if (isSkippableData(relationId)) {
        record[targetColumn] = relationQuery.reference(sourceColumn);
      } else {
        record[targetColumn] = relationId;
      }
    }

    if (sourceIndex === Index.Unique) {
      const relationId = fieldValue[sourceColumn];

      if (!isSkippableData(relationId)) {
        record[sourceColumn] = relationId;
      }
    }
  }

  return record;
};

const preparePreRelations = (data: SqlRecord, relations: RepositoryRelationsWithSchema, sql: SqlBuilder) => {
  const allQueries: InsertRelationsCache = {};

  for (const relationAlias in relations) {
    const relationData = relations[relationAlias];
    const fieldValue = data[relationAlias];

    if (!relationData || isSkippableData(fieldValue)) {
      continue;
    }

    if (!isRelationalData(fieldValue)) {
      throw new InvalidRelationFieldError(relationAlias);
    }

    const isPreRelation = isSingleRelationData(fieldValue);

    const { sourceTable, sourceIndex, sourceColumn, sourceSchema, targetColumn } = relationData;

    const relationQueries: SqlInsertStatement[] = [];

    allQueries[relationAlias] = {
      ...relationData,
      relationQueries
    };

    if (isPreRelation && sourceIndex === Index.Primary) {
      const relationId = fieldValue[targetColumn];

      if (!isSkippableData(relationId)) {
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

const preparePostRelations = (data: SqlRecord, relations: RepositoryRelationsWithSchema, source: SqlSourceWithResults, sql: SqlBuilder) => {
  const allQueries: InsertRelationsCache = {};

  const { results } = source;

  for (const relationAlias in relations) {
    const relationData = relations[relationAlias];
    const fieldValue = data[relationAlias];

    if (!relationData || isSkippableData(fieldValue)) {
      continue;
    }

    if (!isRelationalData(fieldValue)) {
      throw new InvalidRelationFieldError(relationAlias);
    }

    const { sourceTable, sourceIndex, sourceColumn, sourceSchema, targetColumn } = relationData;

    if (sourceIndex === Index.Primary) {
      continue;
    }

    const isMultipleRelation = isMultipleRelationData(fieldValue);

    const allFieldValues = isMultipleRelation ? fieldValue : [fieldValue];

    const relationQueries = [];

    for (const currentValue of allFieldValues) {
      if (sourceIndex === Index.Unique) {
        const uniqueRelationId = currentValue[sourceColumn];

        if (!isSkippableData(uniqueRelationId)) {
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
      ...relationData,
      relationQueries
    };
  }

  return allQueries;
};

const getInsertSelectFields = <T extends Database.Schema, S extends AnyObject, R extends RelationMetadata>(
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

        const relationRecord = getSelectFields(relationFields, {}, sourceSchema, relations, relationQuery, sql, true);

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

        const relationRecord = getInsertSelectFields(relationFields, sourceSchema, relations, undefined, relationQuery, sql, true);

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
