import type { Database, Query } from '@ez4/database';

import { isAnyObject } from '@ez4/utils';

import { prepareWhereFields } from './where.js';
import { prepareOrderFields } from './order.js';

type PrepareResult = [string, unknown[]];

export const prepareSelect = <T extends Database.Schema, S extends Query.SelectInput<T> = {}>(
  table: string,
  index: string | undefined,
  query: Query.FindOneInput<T, S, any> | Query.FindManyInput<T, S, any>
): PrepareResult => {
  const [whereFields, whereVariables] = prepareWhereFields(query.where ?? {});

  const selectFields = prepareSelectFields(query.select);

  const statement = [`SELECT ${selectFields} FROM "${table}"${index ? `."${index}"` : ''}`];

  if (whereFields) {
    statement.push(`WHERE ${whereFields}`);
  }

  if ('order' in query && isAnyObject(query.order)) {
    const orderFields = prepareOrderFields(query.order);

    if (orderFields) {
      statement.push(`ORDER BY ${orderFields}`);
    }
  }

  return [statement.join(' '), whereVariables];
};

const prepareSelectFields = <T extends Database.Schema>(
  fields: Partial<Query.SelectInput<T>>,
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
      selectFields.push(prepareSelectFields(fieldValue, fieldPath));
      continue;
    }

    selectFields.push(fieldPath);
  }

  if (selectFields.length) {
    return selectFields.join(', ');
  }

  return '*';
};
