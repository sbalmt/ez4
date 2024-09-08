import type { Database, Query } from '@ez4/database';
import type { DeepPartial } from '@ez4/utils';

import { isAnyObject } from '@ez4/utils';
import { prepareWhereFields } from './where.js';

type PrepareResult = [string, unknown[]];

export const prepareUpdate = <T extends Database.Schema, S extends Query.SelectInput<T> = {}>(
  table: string,
  query: Query.UpdateOneInput<T, S, never> | Query.UpdateManyInput<T, S>
): PrepareResult => {
  const [updateFields, updateVariables] = prepareUpdateFields(query.data);
  const [whereFields, whereVariables] = prepareWhereFields(query.where ?? {});

  const statement = [`UPDATE "${table}" ${updateFields}`];

  if (whereFields) {
    statement.push(`WHERE ${whereFields}`);
  }

  if (query.select) {
    statement.push('RETURNING ALL OLD *');
  }

  return [statement.join(' '), [...updateVariables, ...whereVariables]];
};

const prepareUpdateFields = <T extends Database.Schema>(
  data: DeepPartial<T>,
  path?: string
): PrepareResult => {
  const operations: string[] = [];
  const variables: unknown[] = [];

  for (const fieldKey in data) {
    const fieldValue = data[fieldKey];

    if (fieldValue === undefined) {
      continue;
    }

    const fieldPath = path ? `${path}."${fieldKey}"` : `"${fieldKey}"`;

    if (isAnyObject(fieldValue)) {
      const [nestedOperations, nestedVariables] = prepareUpdateFields(fieldValue, fieldPath);

      operations.push(nestedOperations);
      variables.push(...nestedVariables);

      continue;
    }

    operations.push(`SET ${fieldPath} = ?`);
    variables.push(fieldValue);
  }

  return [operations.join(' '), variables];
};
