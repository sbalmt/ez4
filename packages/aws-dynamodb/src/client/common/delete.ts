import type { Query } from '@ez4/database';
import type { InternalTableMetadata } from '../types.js';

import { prepareWhereFields } from './where.js';

type PrepareResult = [string, unknown[]];

export const prepareDelete = <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  query: Query.DeleteOneInput<S, T> | Query.DeleteManyInput<S, T>
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
