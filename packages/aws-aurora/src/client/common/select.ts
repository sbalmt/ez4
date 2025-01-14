import type { SqlFilters, SqlJsonColumnSchema, SqlSource } from '@ez4/pgsql';
import type { Database, Relations, Query } from '@ez4/database';
import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { escapeSqlName, mergeSqlAlias, SqlBuilder } from '@ez4/pgsql';
import { isAnyNumber, isAnyObject, isEmptyObject } from '@ez4/utils';
import { isObjectSchema, isStringSchema } from '@ez4/schema';
import { Index } from '@ez4/database';

import { InvalidRelationFieldError, MissingFieldSchemaError } from './errors.js';
import { detectFieldData, isSkippableData, prepareFieldData } from './data.js';

const Sql = new SqlBuilder({
  onPrepareVariable: (value, index, schema) => {
    if (schema) {
      return prepareFieldData(`${index}`, value, schema);
    }

    return detectFieldData(`${index}`, value);
  }
});

const Formats: Record<string, string> = {
  ['date-time']: `'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'`,
  ['time']: `'HH24:MI:SS.MS"Z"'`,
  ['date']: `'YYYY-MM-DD'`
};

export const prepareSelectQuery = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.FindOneInput<T, S, I, R> | Query.FindManyInput<T, S, I, R>
): [string, SqlParameter[]] => {
  const { select, where } = query;

  const selectQuery = Sql.reset().select(schema).from(table);

  selectQuery
    .record(getSelectFields(select, schema, relations, selectQuery))
    .where(where && getSelectFilters(where, relations, selectQuery));

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

export const getSelectFields = <T extends Database.Schema, R extends Relations>(
  fields: Partial<Query.SelectInput<T, R>>,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  source: SqlSource,
  inner?: boolean
) => {
  const allFields = isEmptyObject(fields) ? getDefaultFields(schema) : fields;
  const output: SqlJsonColumnSchema = {};

  for (const fieldKey in allFields) {
    const fieldValue = allFields[fieldKey];

    if (!fieldValue) {
      continue;
    }

    const relationData = relations[fieldKey];

    if (relationData) {
      const { sourceTable, sourceColumn, sourceSchema, sourceIndex, targetColumn } = relationData;

      const relationFields = fieldValue === true ? getDefaultFields(sourceSchema) : fieldValue;

      if (!isAnyObject(relationFields)) {
        throw new InvalidRelationFieldError(fieldKey);
      }

      const relationQuery = Sql.select(sourceSchema)
        .from(sourceTable)
        .where({
          [sourceColumn]: source.reference(targetColumn)
        });

      const relationRecord = getSelectFields(
        relationFields,
        sourceSchema,
        relations,
        relationQuery,
        true
      );

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

    const fieldColumn = getFieldColumn(fieldKey, fieldSchema, !inner);

    if (fieldColumn instanceof Function) {
      output[fieldKey] = source.reference(fieldColumn);
    } else {
      output[fieldKey] = true;
    }
  }

  return output;
};

export const getSelectFilters = (
  filters: SqlFilters,
  relations: RepositoryRelationsWithSchema,
  source: SqlSource
) => {
  const result: SqlFilters = {};

  for (const filterKey in filters) {
    const filterValue = filters[filterKey];

    if (isSkippableData(filterValue)) {
      continue;
    }

    switch (filterKey) {
      case 'NOT':
        result[filterKey] = getSelectFilters(filterValue, relations, source);
        break;

      case 'AND':
      case 'OR':
        result[filterKey] = filterValue.map((operation: SqlFilters) => {
          return getSelectFilters(operation, relations, source);
        });
        break;

      default:
        const relationData = relations[filterKey];

        if (relationData) {
          const { sourceTable, sourceColumn, sourceSchema, targetColumn } = relationData;

          const relationFilters = getRelationFilters(filters, filterKey);
          const relationQuery = Sql.select(sourceSchema).from(sourceTable).rawColumn(1).as('T');

          if (isAnyObject(relationFilters)) {
            relationQuery.where({
              ...relationFilters,
              [sourceColumn]: source.reference(targetColumn)
            });
          } else if (!relationFilters) {
            relationQuery.where({
              [sourceColumn]: {
                not: source.reference(targetColumn)
              }
            });
          } else {
            relationQuery.where({
              [sourceColumn]: source.reference(targetColumn)
            });
          }

          result[filterKey] = relationQuery;
          continue;
        }

        result[filterKey] = filterValue;
    }
  }

  return result;
};

const getRelationFilters = (filters: SqlFilters, relationName: string): unknown => {
  for (const filterKey in filters) {
    const filterValue = filters[filterKey];

    switch (filterKey) {
      case 'NOT':
        return {
          NOT: getRelationFilters(filterValue, relationName)
        };

      case 'AND':
      case 'OR':
        return {
          [filterKey]: filterValue.map((operation: SqlFilters) => {
            return getRelationFilters(operation, relationName);
          })
        };

      default:
        if (filterKey === relationName) {
          return filterValue;
        }
    }
  }

  return undefined;
};

const getDefaultFields = (schema: ObjectSchema) => {
  const fields: Record<string, boolean> = {};

  for (const fieldKey in schema.properties) {
    fields[fieldKey] = true;
  }

  return fields;
};

const getFieldColumn = (column: string, schema: AnySchema, alias?: boolean) => {
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
