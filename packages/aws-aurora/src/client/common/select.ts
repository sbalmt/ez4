import type { SqlBuilder, SqlFilters, SqlJsonColumnSchema, SqlSource } from '@ez4/pgsql';
import type { Database, RelationMetadata, Query } from '@ez4/database';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { AnyObject, isAnyNumber, isAnyObject, isEmptyObject } from '@ez4/utils';
import { isObjectSchema, isStringSchema } from '@ez4/schema';
import { escapeSqlName, mergeSqlAlias } from '@ez4/pgsql';
import { Index } from '@ez4/database';

import { InvalidRelationFieldError, MissingFieldSchemaError } from '../errors.js';
import { createQueryBuilder } from './builder.js';
import { isSkippableData } from './data.js';

const FORMATS: Record<string, string> = {
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

  const selectRecord = getSelectFields(sql, query.select, query.include, schema, relations, selectQuery, table);

  selectQuery.record(selectRecord);

  if (query.where) {
    const selectFilters = getSelectFilters(sql, query.where, relations, selectQuery);

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
  sql: SqlBuilder,
  fields: Query.StrictSelectInput<T, S, R>,
  include: Query.StrictIncludeInput<S, R> | undefined | null,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  source: SqlSource,
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
      const { sourceTable, sourceColumn, sourceSchema, sourceIndex, targetColumn } = fieldRelation;

      const relationFields = fieldValue === true ? getDefaultSelectFields(sourceSchema) : fieldValue;

      if (!isAnyObject(relationFields)) {
        throw new InvalidRelationFieldError(fieldPath);
      }

      const relationFilters = include && include[fieldKey]?.where;

      const relationQuery = sql
        .select(sourceSchema)
        .from(sourceTable)
        .where({
          ...relationFilters,
          [sourceColumn]: source.reference(targetColumn)
        });

      const record = getSelectFields(sql, relationFields, null, sourceSchema, relations, relationQuery, fieldPath, true);

      if (sourceIndex === Index.Primary || sourceIndex === Index.Unique) {
        relationQuery.objectColumn(record);
      } else {
        relationQuery.arrayColumn(record);
      }

      output[fieldKey] = relationQuery;

      source.as('R');
      continue;
    }

    const fieldSchema = schema.properties[fieldKey];

    if (!fieldSchema) {
      throw new MissingFieldSchemaError(fieldPath);
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

export const getSelectFilters = (sql: SqlBuilder, filters: SqlFilters, relations: RepositoryRelationsWithSchema, source: SqlSource) => {
  const result: SqlFilters = {};

  for (const filterKey in filters) {
    if (isSkippableData(filters[filterKey])) {
      continue;
    }

    switch (filterKey) {
      case 'OR':
      case 'AND':
        result[filterKey] = filters[filterKey].map((operation: SqlFilters) => {
          return getSelectFilters(sql, operation, relations, source);
        });
        break;

      case 'NOT':
        result[filterKey] = getSelectFilters(sql, filters[filterKey], relations, source);
        break;

      default:
        const relationFilters = filters[filterKey];
        const fieldRelation = relations[filterKey];

        if (!fieldRelation) {
          result[filterKey] = relationFilters;
          continue;
        }

        const { sourceTable, sourceColumn, sourceSchema, targetColumn } = fieldRelation;

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

  const columnMask = schema.format ? FORMATS[schema.format] : undefined;

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
