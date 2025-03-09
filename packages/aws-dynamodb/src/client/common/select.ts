import type { Database, Query, RelationMetadata } from '@ez4/database';
import type { AnyObject } from '@ez4/utils';

import { isAnyObject } from '@ez4/utils';

import { prepareWhereFields } from './where.js';
import { prepareOrderFields } from './order.js';

type PrepareResult = [string, unknown[]];

export const prepareSelect = <
  T extends Database.Schema,
  S extends Query.SelectInput<T, R>,
  I extends Database.Indexes,
  R extends RelationMetadata
>(
  table: string,
  index: string | undefined,
  query: Query.FindOneInput<T, S, I, R> | Query.FindManyInput<T, S, I, R>
): PrepareResult => {
  const selectFields = getSelectFields(query.select);

  const statement = [`SELECT ${selectFields} FROM "${table}"${index ? `."${index}"` : ''}`];
  const variables = [];

  if (query.where) {
    const [whereFields, whereVariables] = prepareWhereFields(query.where);

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

  return [statement.join(' '), variables];
};

const getSelectFields = <T extends Database.Schema, S extends AnyObject, R extends RelationMetadata>(
  fields: Query.StrictSelectInput<T, S, R>,
  path?: string
): string => {
  const selectFields: string[] = [];

  for (const fieldKey in fields) {
    const fieldValue = fields[fieldKey];

    if (!fieldValue) {
      continue;
    }

    const fieldPath = path ? `${path}."${fieldKey}"` : `"${fieldKey}"`;

    if (isAnyObject(fieldValue)) {
      selectFields.push(getSelectFields(fieldValue, fieldPath));
      continue;
    }

    selectFields.push(fieldPath);
  }

  if (selectFields.length) {
    return selectFields.join(', ');
  }

  return '*';
};
