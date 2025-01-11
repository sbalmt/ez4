import type { SqlFilters, SqlJsonColumnSchema, SqlStatement } from '@ez4/pgsql';
import type { Database, Relations, Query } from '@ez4/database';
import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { isAnyNumber, isAnyObject, isEmptyObject } from '@ez4/utils';
import { escapeSqlName, mergeSqlAlias, SqlBuilder } from '@ez4/pgsql';
import { isObjectSchema, isStringSchema } from '@ez4/schema';
import { Index } from '@ez4/database';

import { InvalidRelationFieldError, MissingFieldSchemaError } from './errors.js';
import { detectFieldData, prepareFieldData } from './data.js';

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

  const selectFilters = where && getSelectFilters(where, relations);
  const selectQuery = Sql.reset().select(schema).from(table).where(selectFilters);

  selectQuery.record(getSelectFields(select, where, schema, relations, selectQuery));

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
  filters: SqlFilters | undefined,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  statement: SqlStatement,
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

      statement.as('R');

      const relationQuery = Sql.select(sourceSchema)
        .from(sourceTable)
        .where({
          ...(filters && filters[fieldKey]),
          [sourceColumn]: statement.reference(targetColumn)
        });

      const relationRecord = getSelectFields(
        relationFields,
        undefined,
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
      output[fieldKey] = statement.reference(fieldColumn);
    } else {
      output[fieldKey] = true;
    }
  }

  return output;
};

export const getSelectFilters = (filters: SqlFilters, relations: RepositoryRelationsWithSchema) => {
  const result: SqlFilters = {};

  for (const filterKey in filters) {
    const filterValue = filters[filterKey];

    if (!filterValue || filterKey in relations) {
      continue;
    }

    switch (filterKey) {
      case 'NOT':
        result[filterKey] = getSelectFilters(filterValue, relations);
        break;

      case 'AND':
      case 'OR':
        result[filterKey] = filterValue.map((operation: SqlFilters) => {
          return getSelectFilters(operation, relations);
        });
        break;

      default:
        result[filterKey] = filterValue;
    }
  }

  return result;
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

  return (statement: SqlStatement) => {
    const columnPath = mergeSqlAlias(columnName, statement.alias);
    const columnResult = `to_char(${columnPath}, ${columnMask})`;

    if (alias) {
      return `${columnResult} AS ${columnName}`;
    }

    return columnResult;
  };
};
