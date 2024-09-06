import type { Database, Query } from '@ez4/database';

import { prepareWhereFields } from './where.js';

type PrepareResult = [string, unknown[]];

export const prepareDelete = <T extends Database.Schema, U extends Query.SelectInput<T> = {}>(
  table: string,
  query: Query.DeleteOneInput<T, U> | Query.DeleteManyInput<T, U>
): PrepareResult => {
  const [whereFields, whereVariables] = prepareWhereFields(query.where ?? {});

  const statement = [`DELETE FROM "${table}"`];

  if (whereFields) {
    statement.push(`WHERE ${whereFields}`);
  }

  if (query.select) {
    statement.push('RETURNING ALL OLD *');
  }

  return [statement.join(' '), whereVariables];
};
