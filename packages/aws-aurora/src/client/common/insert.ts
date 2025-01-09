import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { SqlInsertStatement, SqlStatementWithResults, SqlRecord } from '@ez4/pgsql';
import type { Database, Relations, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { mergeSqlAlias, SqlBuilder } from '@ez4/pgsql';
import { isAnyObject } from '@ez4/utils';
import { Index } from '@ez4/database';

import { detectFieldData, isSkippableData, prepareFieldData } from './data.js';
import { InvalidRelationFieldError } from './errors.js';

const Sql = new SqlBuilder({
  onPrepareVariable: (value, index, schema) => {
    if (schema) {
      return prepareFieldData(`${index}`, value, schema);
    }

    return detectFieldData(`${index}`, value);
  }
});

export const prepareInsertQuery = <T extends Database.Schema, R extends Relations>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.InsertOneInput<T, R>
): [string, SqlParameter[]] => {
  const preQueries = preparePreRelations(query.data, relations);
  const lastQuery = preQueries[preQueries.length - 1];

  const insertQuery = Sql.reset()
    .insert(schema)
    .select(lastQuery)
    .record(getInsertRecord(query.data, relations, lastQuery))
    .into(table)
    .returning();

  const postQueries = preparePostRelations(query.data, relations, insertQuery);
  const allQueries = [...preQueries, insertQuery, ...postQueries];

  const [statement, variables] = Sql.with(allQueries, 'R').build();

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

const preparePreRelations = (data: SqlRecord, relations: RepositoryRelationsWithSchema) => {
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

      const relationQuery = Sql.insert(sourceSchema)
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
  statement: SqlStatementWithResults
) => {
  const { results } = statement;

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

      const relationQuery = Sql.insert(sourceSchema)
        .into(sourceTable)
        .select(statement)
        .record({
          ...currentValue,
          [sourceColumn]: statement.reference(targetColumn)
        });

      if (!results.has(targetColumn)) {
        results.column(targetColumn);
      }

      allQueries.push(relationQuery);
    }
  }

  return allQueries;
};
