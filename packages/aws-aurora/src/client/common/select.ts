import type { SqlBuilder, SqlFilters, SqlJsonColumnSchema, SqlSource } from '@ez4/pgsql';
import type { Database, RelationMetadata, Query } from '@ez4/database';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { AnyObject, isAnyNumber, isAnyObject, isEmptyObject } from '@ez4/utils';
import { isObjectSchema, isStringSchema } from '@ez4/schema';
import { escapeSqlName, mergeSqlAlias } from '@ez4/pgsql';
import { Index } from '@ez4/database';

import { InvalidRelationFieldError, MissingFieldSchemaError } from './errors.js';
import { createQueryBuilder } from './builder.js';
import { isSkippableData } from './data.js';

const Formats: Record<string, string> = {
  ['date-time']: `'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'`,
  ['time']: `'HH24:MI:SS.MS"Z"'`,
  ['date']: `'YYYY-MM-DD'`
};

export const prepareSelectQuery = <
  T extends Database.Schema,
  S extends Query.SelectInput<T, R>,
  I extends Database.Indexes,
  R extends RelationMetadata,
  C extends boolean
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.FindOneInput<T, S, I, R> | Query.FindManyInput<T, S, I, R, C>
): [string, SqlParameter[]] => {
  const sql = createQueryBuilder();

  const selectQuery = sql.select(schema).from(table);

  const selectRecord = getSelectFields(table, query.select, query.include, schema, relations, selectQuery, sql);

  selectQuery.record(selectRecord);

  if (query.where) {
    const selectFilters = getSelectFilters(query.where, relations, selectQuery, sql);

    selectQuery.where(selectFilters);
  }

  if ('order' in query) {
    selectQuery.order(query.order);
  }

  if ('cursor' in query && isAnyNumber(query.cursor)) {
    selectQuery.skip(query.cursor);
  }

  if ('limit' in query && isAnyNumber(query.limit)) {
    selectQuery.take(query.limit);
  }

  const [statement, variables] = selectQuery.build();

  return [statement, variables as SqlParameter[]];
};

export const getSelectFields = <T extends Database.Schema, S extends AnyObject, R extends RelationMetadata>(
  table: string,
  fields: Query.StrictSelectInput<T, S, R>,
  include: SqlFilters | undefined | null,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  source: SqlSource,
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

    const relationData = relations[fieldKey];

    if (relationData) {
      const { sourceTable, sourceColumn, sourceSchema, sourceIndex, targetColumn } = relationData;

      const relationFields = fieldValue === true ? getDefaultSelectFields(sourceSchema) : fieldValue;

      if (!isAnyObject(relationFields)) {
        throw new InvalidRelationFieldError(table, fieldKey);
      }

      const relationFilters = include && include[fieldKey];

      const relationQuery = sql
        .select(sourceSchema)
        .from(sourceTable)
        .where({
          ...relationFilters,
          [sourceColumn]: source.reference(targetColumn)
        });

      const relationRecord = getSelectFields(table, relationFields, relationFilters, sourceSchema, relations, relationQuery, sql, true);

      if (sourceIndex === Index.Primary || sourceIndex === Index.Unique) {
        relationQuery.objectColumn(relationRecord);
      } else {
        relationQuery.arrayColumn(relationRecord);
      }

      output[fieldKey] = relationQuery;

      source.as('R');

      continue;
    }

    const fieldSchema = schema.properties[fieldKey];

    if (!fieldSchema) {
      throw new MissingFieldSchemaError(fieldKey);
    }

    if (isObjectSchema(fieldSchema)) {
      output[fieldKey] = fieldValue;
      continue;
    }

    const fieldColumn = getFieldColumn(fieldKey, fieldSchema, !json);

    if (fieldColumn instanceof Function) {
      output[fieldKey] = source.reference(fieldColumn);
    } else {
      output[fieldKey] = true;
    }
  }

  return output;
};

export const getSelectFilters = (filters: SqlFilters, relations: RepositoryRelationsWithSchema, source: SqlSource, sql: SqlBuilder) => {
  const result: SqlFilters = {};

  for (const filterKey in filters) {
    if (isSkippableData(filters[filterKey])) {
      continue;
    }

    switch (filterKey) {
      case 'OR':
      case 'AND':
        result[filterKey] = filters[filterKey].map((operation: SqlFilters) => {
          return getSelectFilters(operation, relations, source, sql);
        });
        break;

      case 'NOT':
        result[filterKey] = getSelectFilters(filters[filterKey], relations, source, sql);
        break;

      default:
        const relationFilters = filters[filterKey];
        const relationData = relations[filterKey];

        if (!relationData) {
          result[filterKey] = relationFilters;
          continue;
        }

        const { sourceTable, sourceColumn, sourceSchema, targetColumn } = relationData;

        const relationQuery = sql.select(sourceSchema).from(sourceTable).rawColumn(1).as('T');

        result[filterKey] = relationQuery;

        source.as('R');

        if (relationFilters) {
          relationQuery.where({
            ...relationFilters,
            [sourceColumn]: source.reference(targetColumn)
          });

          continue;
        }

        relationQuery.where({
          [sourceColumn]: {
            not: source.reference(targetColumn)
          }
        });
    }
  }

  return result;
};

export const getDefaultSelectFields = (schema: ObjectSchema) => {
  const fields: Record<string, boolean> = {};

  for (const fieldKey in schema.properties) {
    fields[fieldKey] = true;
  }

  return fields;
};

export const getFieldColumn = (column: string, schema: AnySchema, alias?: boolean) => {
  if (!isStringSchema(schema)) {
    return column;
  }

  const columnMask = schema.format ? Formats[schema.format] : undefined;

  if (!columnMask) {
    return column;
  }

  const columnName = escapeSqlName(column);

  return (source: SqlSource) => {
    const columnPath = mergeSqlAlias(columnName, source.alias);
    const columnResult = `to_char(${columnPath}, ${columnMask})`;

    if (alias) {
      return `${columnResult} AS ${columnName}`;
    }

    return columnResult;
  };
};
