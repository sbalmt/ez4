import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { Database, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';
import type { DeepPartial } from '@ez4/utils';

import { SchemaTypeName } from '@ez4/schema';
import { isAnyObject } from '@ez4/utils';

import { prepareSelectFields } from './select.js';
import { prepareWhereFields } from './where.js';
import { prepareFieldData } from './data.js';

type PrepareResult = [string, SqlParameter[]];

export const prepareUpdate = <T extends Database.Schema, S extends Query.SelectInput<T> = {}>(
  table: string,
  schema: ObjectSchema,
  query: Query.UpdateOneInput<T, S, never> | Query.UpdateManyInput<T, S>
): PrepareResult => {
  const [updateFields, updateVariables] = prepareUpdateFields(schema, query.data);
  const [whereFields, whereVariables] = prepareWhereFields(schema, query.where ?? {});

  const statement = [`UPDATE "${table}" SET ${updateFields}`];

  if (whereFields) {
    statement.push(`WHERE ${whereFields}`);
  }

  if (query.select) {
    const selectFields = prepareSelectFields(query.select);

    statement.push(`RETURNING ${selectFields}`);
  }

  return [statement.join(' '), [...updateVariables, ...whereVariables]];
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
