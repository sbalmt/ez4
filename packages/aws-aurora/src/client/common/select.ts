import type { Database, Relations, Query } from '@ez4/database';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { ObjectSchema } from '@ez4/schema';

import { isAnyNumber, isAnyObject } from '@ez4/utils';

import { prepareWhereFields } from './where.js';
import { prepareOrderFields } from './order.js';

type PrepareResult = [string, SqlParameter[]];

export const prepareSelect = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  schema: ObjectSchema,
  query: Query.FindOneInput<T, S, I> | Query.FindManyInput<T, S, I>
): PrepareResult => {
  const selectFields = prepareSelectFields(query.select);

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
  path?: string
): string => {
  const selectFields: string[] = [];

  for (const fieldKey in fields) {
    const fieldValue = fields[fieldKey];

    if (!fieldValue) {
      continue;
    }

    const fieldPath = path ? `${path}['${fieldKey}']` : `"${fieldKey}"`;

    if (isAnyObject(fieldValue)) {
      const fieldObject = prepareSelectFields(fieldValue, fieldPath);

      selectFields.push(`JSONB_BUILD_OBJECT(${fieldObject}) AS "${fieldKey}"`);
      continue;
    }

    if (path) {
      selectFields.push(`'${fieldKey}', ${fieldPath}`);
      continue;
    }

    selectFields.push(fieldPath);
  }

  if (selectFields.length) {
    return selectFields.join(', ');
  }

  return '*';
};
