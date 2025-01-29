import type { Database, RelationMetadata, Query } from '@ez4/database';

import { prepareWhereFields } from './where.js';

type PrepareResult = [string, unknown[]];

export const prepareDelete = <
  T extends Database.Schema,
  S extends Query.SelectInput<T, R>,
  I extends Database.Indexes<T>,
  R extends RelationMetadata
>(
  table: string,
  query: Query.DeleteOneInput<T, S, I, R> | Query.DeleteManyInput<T, S, R>
): PrepareResult => {
  const statement = [`DELETE FROM "${table}"`];
  const variables = [];

  if (query.where) {
    const [whereFields, whereVariables] = prepareWhereFields(query.where);

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
