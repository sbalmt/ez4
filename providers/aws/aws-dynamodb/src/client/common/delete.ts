import type { ObjectSchema } from '@ez4/schema';
import type { Query } from '@ez4/database';
import type { InternalTableMetadata } from '../types';

import { prepareWhereFields } from './where';

type PrepareResult = [string, unknown[]];

export const prepareDelete = <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  query: Query.DeleteOneInput<S, T> | Query.DeleteManyInput<S, T>
): PrepareResult => {
  const statement = [`DELETE FROM "${table}"`];
  const variables = [];

  if (query.where) {
    const [whereFields, whereVariables] = prepareWhereFields(query.where, schema);

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
