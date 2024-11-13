import type { ObjectSchema } from '@ez4/schema';
import type { Database, Relations, Query } from '@ez4/database';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { isAnyNumber, isAnyObject } from '@ez4/utils';
import { isObjectSchema } from '@ez4/schema';

import { prepareWhereFields } from './where.js';
import { prepareOrderFields } from './order.js';

type PrepareResult = [string, SqlParameter[]];

export const prepareSelectQuery = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.FindOneInput<T, S, I> | Query.FindManyInput<T, S, I>
): PrepareResult => {
  const selectFields = prepareSelectFields(query.select, schema, relations);

  const statement = [`SELECT ${selectFields} FROM "${table}"`];
  const variables = [];

  if (query.where) {
    const [whereFields, whereVariables] = prepareWhereFields(schema, query.where);

    if (whereFields) {
      statement.push(`WHERE ${whereFields}`);
      variables.push(...whereVariables);
    }
  }

  if ('order' in query && isAnyObject(query.order)) {
    const orderFields = prepareOrderFields(query.order);

    if (orderFields) {
      statement.push(`ORDER BY ${orderFields}`);
    }
  }

  if ('cursor' in query && isAnyNumber(query.cursor)) {
    statement.push(`OFFSET ${query.cursor}`);
  }

  if ('limit' in query && isAnyNumber(query.limit)) {
    statement.push(`LIMIT ${query.limit}`);
  }

  return [statement.join(' '), variables];
};

export const prepareSelectFields = <T extends Database.Schema, R extends Relations>(
  fields: Partial<Query.SelectInput<T, R>>,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema
): string => {
  return getSelectFields(fields, schema, relations, null, false);
};

const getSelectFields = <T extends Database.Schema, R extends Relations>(
  fields: Partial<Query.SelectInput<T, R>>,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  path: string | null,
  object: boolean
): string => {
  const selectFields: string[] = [];

  for (const fieldKey in fields) {
    const fieldValue = fields[fieldKey];

    if (!fieldValue) {
      continue;
    }

    const fieldRelation = relations[fieldKey];

    if (fieldRelation) {
      const { sourceTable, sourceColumn, sourceSchema, targetColumn } = fieldRelation;

      const relationFields = getSelectFields(fieldValue, sourceSchema, {}, null, true);

      const relationSelect =
        `SELECT json_build_object(${relationFields}) ` +
        `FROM "${sourceTable}" WHERE "${sourceColumn}" = "${targetColumn}"`;

      selectFields.push(`(${relationSelect}) AS "${fieldKey}"`);
      continue;
    }

    const fieldPath = path ? `${path}['${fieldKey}']` : `"${fieldKey}"`;

    const fieldSchema = schema.properties[fieldKey];

    if (!fieldSchema) {
      throw new Error(`Field schema for ${fieldValue} doesn't exists.`);
    }

    if (isObjectSchema(fieldSchema) && isAnyObject(fieldValue)) {
      const fieldObject = getSelectFields(fieldValue, fieldSchema, relations, fieldPath, true);

      selectFields.push(`json_build_object(${fieldObject}) AS "${fieldKey}"`);
      continue;
    }

    if (path || object) {
      selectFields.push(`'${fieldKey}', ${fieldPath}`);
      continue;
    }

    selectFields.push(fieldPath);
  }

  if (selectFields.length) {
    return selectFields.join(', ');
  }

  return getSchemaFields(schema, object).join(', ');
};

const getSchemaFields = (schema: ObjectSchema, object: boolean) => {
  const fields = [];

  for (const fieldKey in schema.properties) {
    fields.push(object ? `'${fieldKey}', "${fieldKey}"` : `"${fieldKey}"`);
  }

  return fields;
};
