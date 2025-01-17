import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { SqlInsertStatement, SqlSourceWithResults, SqlRecord, SqlBuilder } from '@ez4/pgsql';
import type { Database, RelationMetadata, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { mergeSqlAlias } from '@ez4/pgsql';
import { isAnyObject } from '@ez4/utils';
import { Index } from '@ez4/database';

import { InvalidRelationFieldError } from './errors.js';
import { createQueryBuilder } from './builder.js';
import { isSkippableData } from './data.js';

export const prepareInsertQuery = <T extends Database.Schema, R extends RelationMetadata>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.InsertOneInput<T, R>
): [string, SqlParameter[]] => {
  const sql = createQueryBuilder();

  const preQueries = preparePreRelations(query.data, relations, sql);
  const lastQuery = preQueries[preQueries.length - 1];

  const insertRecord = getInsertRecord(query.data, relations, lastQuery);

  const insertQuery = sql
    .insert(schema)
    .record(insertRecord)
    .select(lastQuery)
    .into(table)
    .returning();

  const postQueries = preparePostRelations(query.data, relations, insertQuery, sql);
  const allQueries = [...preQueries, insertQuery, ...postQueries];

  const [statement, variables] = sql.with(allQueries, 'R').build();

  return [statement, variables as SqlParameter[]];
};

const getInsertRecord = (
  data: SqlRecord,
  relations: RepositoryRelationsWithSchema,
  statement: SqlInsertStatement
) => {
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

    if (!isAnyObject(fieldValue)) {
      throw new InvalidRelationFieldError(fieldKey);
    }

    const { sourceColumn, sourceIndex, targetColumn } = relationData;

    if (sourceIndex === Index.Unique) {
      const relationId = fieldValue[sourceColumn];

      if (!isSkippableData(relationId)) {
        record[sourceColumn] = relationId;
      }
    }

    if (sourceIndex === Index.Primary) {
      const relationId = fieldValue[targetColumn];

      if (isSkippableData(relationId)) {
        record[targetColumn] = statement.reference(fieldKey);
      } else {
        record[targetColumn] = relationId;
      }
    }
  }

  return record;
};

const preparePreRelations = (
  data: SqlRecord,
  relations: RepositoryRelationsWithSchema,
  sql: SqlBuilder
) => {
  const allQueries = [];

  let previousQuery;

  for (const alias in relations) {
    const relationData = relations[alias];
    const fieldValue = data[alias];

    if (!relationData || isSkippableData(fieldValue)) {
      continue;
    }

    if (!isAnyObject(fieldValue)) {
      throw new InvalidRelationFieldError(alias);
    }

    const { sourceTable, sourceIndex, sourceColumn, sourceSchema, targetColumn } = relationData;

    if (sourceIndex === Index.Primary) {
      const relationId = fieldValue[targetColumn];

      if (!isSkippableData(relationId)) {
        continue;
      }

      const relationQuery = sql
        .insert(sourceSchema)
        .into(sourceTable)
        .record(fieldValue)
        .returning({
          [sourceColumn]: alias
        });

      allQueries.push(relationQuery);

      if (previousQuery) {
        const previousColumns = previousQuery.reference(({ alias }) => {
          return mergeSqlAlias('*', alias);
        });

        relationQuery.results.column(previousColumns);
      }

      previousQuery = relationQuery;
    }
  }

  return allQueries;
};

const preparePostRelations = (
  data: SqlRecord,
  relations: RepositoryRelationsWithSchema,
  source: SqlSourceWithResults,
  sql: SqlBuilder
) => {
  const { results } = source;

  const allQueries = [];

  for (const alias in relations) {
    const relationData = relations[alias];
    const fieldValue = data[alias];

    if (!relationData || isSkippableData(fieldValue)) {
      continue;
    }

    if (!isAnyObject(fieldValue)) {
      throw new InvalidRelationFieldError(alias);
    }

    const { sourceTable, sourceIndex, sourceColumn, sourceSchema, targetColumn } = relationData;

    if (sourceIndex === Index.Primary) {
      continue;
    }

    const allValues = Array.isArray(fieldValue) ? fieldValue : [fieldValue];

    for (const currentValue of allValues) {
      const relationId = fieldValue[sourceIndex === Index.Unique ? sourceColumn : targetColumn];

      if (!isSkippableData(relationId)) {
        continue;
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

      allQueries.push(relationQuery);
    }
  }

  return allQueries;
};
