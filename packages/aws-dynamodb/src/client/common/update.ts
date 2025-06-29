import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { Query } from '@ez4/database';
import type { InternalTableMetadata } from '../types.js';

import { isAnyObject } from '@ez4/utils';
import { SchemaType } from '@ez4/schema';

import { prepareWhereFields } from './where.js';
import { isSkippableData } from './data.js';

type PrepareResult = [string, unknown[]];

export const prepareUpdate = <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  query: Query.UpdateOneInput<S, T> | Query.UpdateManyInput<S, T>
): PrepareResult => {
  const [updateFields, variables] = prepareUpdateFields(query.data, schema);

  const statement = [`UPDATE "${table}" ${updateFields}`];

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

const prepareUpdateFields = (data: AnyObject, schema: ObjectSchema, path?: string): PrepareResult => {
  const operations: string[] = [];
  const variables: unknown[] = [];

  for (const fieldKey in data) {
    const fieldValue = data[fieldKey];
    const fieldSchema = schema.properties[fieldKey];

    if (isSkippableData(fieldValue)) {
      continue;
    }

    if (!fieldSchema) {
      throw new Error(`Field schema for ${fieldKey} doesn't exists.`);
    }

    const fieldPath = path ? `${path}."${fieldKey}"` : `"${fieldKey}"`;

    const fieldNotNested =
      !isAnyObject(fieldValue) ||
      fieldSchema.type !== SchemaType.Object ||
      fieldSchema.definitions?.extensible ||
      fieldSchema.additional ||
      fieldSchema.nullable ||
      fieldSchema.optional;

    if (fieldNotNested) {
      if (fieldValue === null && fieldSchema.nullable) {
        operations.push(`REMOVE ${fieldPath}`);
        continue;
      }

      operations.push(`SET ${fieldPath} = ?`);
      variables.push(fieldValue);

      continue;
    }

    const [nestedOperations, nestedVariables] = prepareUpdateFields(fieldValue, fieldSchema, fieldPath);

    operations.push(nestedOperations);
    variables.push(...nestedVariables);
  }

  return [operations.join(' '), variables];
};
