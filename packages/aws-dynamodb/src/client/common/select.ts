import type { Query, TableMetadata } from '@ez4/database';

import { AnyObject, isAnyObject } from '@ez4/utils';

import { prepareWhereFields } from './where.js';
import { prepareOrderFields } from './order.js';

type PrepareResult = [string, unknown[]];

export const prepareSelect = <T extends TableMetadata, S extends Query.SelectInput<T>, C extends boolean>(
  table: string,
  index: string | undefined,
  query: Query.FindOneInput<S, T> | Query.FindManyInput<S, T, C>
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

const getSelectFields = <T extends TableMetadata, S extends AnyObject>(fields: Query.StrictSelectInput<S, T>, path?: string): string => {
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
