import type { Database, Query, RelationMetadata } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { isSkippableData } from './data.js';

type PrepareResult = [string, unknown[]];

export const prepareInsert = <T extends Database.Schema, S extends Query.SelectInput<T, R>, R extends RelationMetadata>(
  table: string,
  schema: ObjectSchema,
  query: Query.InsertOneInput<T, S, R>
): PrepareResult => {
  const [insertFields, variables] = prepareInsertFields(query.data, schema);

  const statement = `INSERT INTO "${table}" value ${insertFields}`;

  return [statement, variables];
};

const prepareInsertFields = (data: AnyObject, schema: ObjectSchema): PrepareResult => {
  const properties: string[] = [];
  const variables: unknown[] = [];

  for (const fieldKey in data) {
    const fieldValue = data[fieldKey];

    if (isSkippableData(fieldValue)) {
      continue;
    }

    const fieldSchema = schema.properties[fieldKey];

    if (!fieldSchema) {
      throw new Error(`Field schema for ${fieldKey} doesn't exists.`);
    }

    if (fieldValue === null && fieldSchema.nullable) {
      continue;
    }

    properties.push(`'${fieldKey}': ?`);
    variables.push(fieldValue);
  }

  return [`{ ${properties.join(', ')} }`, variables];
};
