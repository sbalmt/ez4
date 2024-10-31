import type { Database, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';
import type { DeepPartial } from '@ez4/utils';

import { SchemaTypeName } from '@ez4/schema';
import { isAnyObject } from '@ez4/utils';

import { prepareWhereFields } from './where.js';

type PrepareResult = [string, unknown[]];

export const prepareUpdate = <T extends Database.Schema, S extends Query.SelectInput<T> = {}>(
  table: string,
  schema: ObjectSchema,
  query: Query.UpdateOneInput<T, S, never> | Query.UpdateManyInput<T, S>
): PrepareResult => {
  const [updateFields, updateVariables] = prepareUpdateFields(query.data, schema);
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
  schema: ObjectSchema,
  path?: string
): PrepareResult => {
  const operations: string[] = [];
  const variables: unknown[] = [];

  for (const fieldKey in data) {
    const fieldValue = data[fieldKey];
    const fieldSchema = schema.properties[fieldKey];

    if (!fieldSchema || fieldValue === undefined) {
      continue;
    }

    const fieldPath = path ? `${path}."${fieldKey}"` : `"${fieldKey}"`;

    const fieldNotNested =
      !isAnyObject(fieldValue) ||
      fieldSchema.type !== SchemaTypeName.Object ||
      fieldSchema.extra?.extensible ||
      fieldSchema.nullable ||
      fieldSchema.optional;

    if (fieldNotNested) {
      operations.push(`SET ${fieldPath} = ?`);
      variables.push(fieldValue);

      continue;
    }

    const [nestedOperations, nestedVariables] = prepareUpdateFields(
      fieldValue,
      fieldSchema,
      fieldPath
    );

    operations.push(nestedOperations);
    variables.push(...nestedVariables);
  }

  return [operations.join(' '), variables];
};
