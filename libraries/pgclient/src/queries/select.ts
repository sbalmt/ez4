import type { SqlBuilder, SqlFilters, SqlJsonColumnSchema, SqlSource } from '@ez4/pgsql';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { Query } from '@ez4/database';
import type { PgRelationRepositoryWithSchema } from '../types/repository';
import type { InternalTableMetadata } from '../types/table';

import { InvalidRelationFieldError, MissingFieldSchemaError } from '@ez4/pgclient';
import { isAnyNumber, isAnyObject, isEmptyObject } from '@ez4/utils';
import { isObjectSchema, isStringSchema } from '@ez4/schema';
import { escapeSqlName, mergeSqlAlias } from '@ez4/pgsql';
import { Index } from '@ez4/database';

const FORMATS: Record<string, string> = {
  ['date-time']: `'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'`,
  ['time']: `'HH24:MI:SS.MS"Z"'`,
  ['date']: `'YYYY-MM-DD'`
};

export const prepareSelectQuery = <T extends InternalTableMetadata, S extends Query.SelectInput<T>, C extends boolean>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  query: Query.FindOneInput<S, T> | Query.FindManyInput<S, C, T>,
  builder: SqlBuilder
): [string, SqlParameter[]] => {
  const selectQuery = builder.select(schema).from(table);

  const selectRecord = getSelectFields(builder, query.select, query.include, schema, relations, selectQuery, table);

  selectQuery.record(selectRecord);

  if (query.where) {
    const selectFilters = getSelectFilters(builder, query.where, relations, selectQuery, table);

    selectQuery.where(selectFilters);
  }

  if ('order' in query) {
    selectQuery.order(query.order);
  }

  if ('skip' in query && isAnyNumber(query.skip)) {
    selectQuery.skip(query.skip);
  }

  if ('take' in query && isAnyNumber(query.take)) {
    selectQuery.take(query.take);
  }

  if ('lock' in query && query.lock) {
    selectQuery.lock();
  }

  const [statement, variables] = selectQuery.build();

  return [statement, variables as SqlParameter[]];
};

export const getSelectFields = <T extends InternalTableMetadata, S extends AnyObject>(
  builder: SqlBuilder,
  fields: Query.StrictSelectInput<S, T>,
  include: Query.StrictIncludeInput<S, T> | undefined | null,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
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

    const fieldPath = `${path}.${fieldKey}`;

    const fieldRelation = relations[fieldPath];

    if (fieldRelation) {
      const { sourceTable, sourceColumn, sourceSchema, sourceIndex, targetColumn } = fieldRelation;

      const relationFields = fieldValue === true ? getDefaultSelectFields(sourceSchema) : fieldValue;

      if (!isAnyObject(relationFields)) {
        throw new InvalidRelationFieldError(fieldPath);
      }

      const relationIncludes = include && include[fieldKey];

      const relationQuery = builder
        .select(sourceSchema)
        .from(sourceTable)
        .where({
          ...relationIncludes?.where,
          [sourceColumn]: source.reference(targetColumn)
        });

      if (!source.alias) {
        source.as(builder.alias('R'));
      }

      if (sourceIndex === Index.Primary || sourceIndex === Index.Unique) {
        const record = getSelectFields(builder, relationFields, null, sourceSchema, relations, relationQuery, sourceTable, true);

        relationQuery.objectColumn(record, {
          binary: true
        });

        output[fieldKey] = relationQuery;
        continue;
      }

      if (!relationIncludes || (!('skip' in relationIncludes) && !('take' in relationIncludes))) {
        const record = getSelectFields(builder, relationFields, null, sourceSchema, relations, relationQuery, sourceTable, true);

        relationQuery.arrayColumn(record, {
          order: relationIncludes?.order,
          binary: true
        });

        output[fieldKey] = relationQuery;
        continue;
      }

      const record = getSelectFields(builder, relationFields, null, sourceSchema, relations, relationQuery, sourceTable);

      relationQuery.order(relationIncludes?.order).record(record);

      if ('skip' in relationIncludes) {
        relationQuery.skip(relationIncludes.skip);
      }

      if ('take' in relationIncludes) {
        relationQuery.take(relationIncludes.take);
      }

      const wrapQuery = builder.select().from(relationQuery);

      wrapQuery.arrayColumn(relationFields, {
        order: relationIncludes?.order,
        binary: true
      });

      output[fieldKey] = wrapQuery;
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

export const getSelectFilters = (
  builder: SqlBuilder,
  filters: SqlFilters,
  relations: PgRelationRepositoryWithSchema,
  source: SqlSource,
  path: string
) => {
  const result: SqlFilters = {};

  for (const filterKey in filters) {
    if (filters[filterKey] === undefined) {
      continue;
    }

    switch (filterKey) {
      case 'OR':
      case 'AND':
        result[filterKey] = filters[filterKey].map((operation: SqlFilters) => {
          return getSelectFilters(builder, operation, relations, source, path);
        });
        break;

      case 'NOT':
        result[filterKey] = getSelectFilters(builder, filters[filterKey], relations, source, path);
        break;

      default:
        const relationFilters = filters[filterKey];

        const filterPath = `${path}.${filterKey}`;
        const fieldRelation = relations[filterPath];

        if (!fieldRelation) {
          result[filterKey] = relationFilters;
          continue;
        }

        const { sourceTable, sourceColumn, sourceSchema, targetColumn } = fieldRelation;

        const relationQuery = builder.select(sourceSchema).from(sourceTable).rawColumn(1).as('T');

        result[filterKey] = relationQuery;

        if (!source.alias) {
          source.as(builder.alias('R'));
        }

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
