import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { Database, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { prepareSelectFields } from './select.js';
import { prepareWhereFields } from './where.js';

type PrepareResult = [string, SqlParameter[]];

export const prepareDelete = <T extends Database.Schema, S extends Query.SelectInput<T> = {}>(
  table: string,
  schema: ObjectSchema,
  query: Query.DeleteOneInput<T, S, any> | Query.DeleteManyInput<T, S>
): PrepareResult => {
  const [whereFields, whereVariables] = prepareWhereFields(schema, query.where ?? {});

  const statement = [`DELETE FROM "${table}"`];

  if (whereFields) {
    statement.push(`WHERE ${whereFields}`);
  }

  if (query.select) {
    const selectFields = prepareSelectFields(query.select);

    statement.push(`RETURNING ${selectFields}`);
  }

  return [statement.join(' '), whereVariables];
};
