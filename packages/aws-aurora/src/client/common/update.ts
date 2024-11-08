import type { Database, Relations, Query } from '@ez4/database';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { ObjectSchema } from '@ez4/schema';
import type { DeepPartial } from '@ez4/utils';

import { SchemaTypeName } from '@ez4/schema';
import { isAnyObject } from '@ez4/utils';

import { prepareSelectFields } from './select.js';
import { prepareWhereFields } from './where.js';
import { prepareFieldData } from './data.js';

type PrepareResult = [string, SqlParameter[]];

export const prepareUpdate = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  schema: ObjectSchema,
  query: Query.UpdateOneInput<T, S, I, R> | Query.UpdateManyInput<T, S>
): PrepareResult => {
  const [updateFields, variables] = prepareUpdateFields(schema, query.data);

  const statement = [`UPDATE "${table}" SET ${updateFields}`];

  if (query.where) {
    const [whereFields, whereVariables] = prepareWhereFields(schema, query.where);

    if (whereFields) {
      statement.push(`WHERE ${whereFields}`);
      variables.push(...whereVariables);
    }
  }

  if (query.select) {
    const selectFields = prepareSelectFields(query.select);

    statement.push(`RETURNING ${selectFields}`);
  }

  return [statement.join(' '), variables];
};

const prepareUpdateFields = <T extends Database.Schema>(
  schema: ObjectSchema,
  data: DeepPartial<T>
): PrepareResult => {
  const operations: string[] = [];
  const variables: SqlParameter[] = [];

  const prepareAll = (schema: ObjectSchema, data: DeepPartial<T>, path?: string) => {
    for (const fieldKey in data) {
      const fieldValue = data[fieldKey];
      const fieldSchema = schema.properties[fieldKey];

      if (fieldValue === undefined) {
        continue;
      }

      if (!fieldSchema) {
        throw new Error(`Field schema for ${fieldKey} doesn't exists.`);
      }

      const fieldPath = path ? `${path}['${fieldKey}']` : `"${fieldKey}"`;

      const fieldNotNested =
        !isAnyObject(fieldValue) ||
        fieldSchema.type !== SchemaTypeName.Object ||
        fieldSchema.nullable ||
        fieldSchema.optional;

      if (fieldNotNested) {
        const fieldName = `u${variables.length}`;
        const fieldData = prepareFieldData(fieldName, fieldValue, fieldSchema);

        operations.push(`${fieldPath} = :${fieldName}`);
        variables.push(fieldData);

        continue;
      }

      prepareAll(fieldSchema, fieldValue, fieldPath);
    }
  };

  prepareAll(schema, data);

  return [operations.join(', '), variables];
};
