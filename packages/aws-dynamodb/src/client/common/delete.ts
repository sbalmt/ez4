import type { Database, Relations, Query } from '@ez4/database';

import { prepareWhereFields } from './where.js';

type PrepareResult = [string, unknown[]];

export const prepareDelete = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  query: Query.DeleteOneInput<T, S, I, R> | Query.DeleteManyInput<T, S, R>
): PrepareResult => {
  const statement = [`DELETE FROM "${table}"`];
  const variables = [];

  if (query.where) {
    const [whereFields, whereVariables] = prepareWhereFields<T, I>(query.where);

    if (whereFields) {
      statement.push(`WHERE ${whereFields}`);
      variables.push(...whereVariables);
    }
  }

  if (query.select) {
    statement.push('RETURNING ALL OLD *');
  }

  return [statement.join(' '), variables];
};
