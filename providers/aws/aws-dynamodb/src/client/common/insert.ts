import type { Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { InternalTableMetadata } from '../types';

import { isNullishSchema } from '@ez4/schema';
import { arrayUnique } from '@ez4/utils';
import { getWithSchemaValidation } from './schema';

type PrepareResult = [string, unknown[]];

export const prepareInsert = async <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  indexes: string[][],
  query: Query.InsertOneInput<S, T>
): Promise<PrepareResult> => {
  const uniqueIndexes = arrayUnique(...indexes);

  const [insertFields, variables] = await prepareInsertFields(query.data, schema, uniqueIndexes);

  const statement = `INSERT INTO "${table}" value ${insertFields}`;

  return [statement, variables];
};

const prepareInsertFields = async (data: AnyObject, schema: ObjectSchema, indexes: string[]): Promise<PrepareResult> => {
  const properties: string[] = [];
  const variables: unknown[] = [];

  for (const fieldKey in data) {
    const fieldValue = data[fieldKey];

    if (fieldValue === undefined) {
      continue;
    }

    const fieldSchema = schema.properties[fieldKey];

    // Skip values that aren't mapped in the table schema.
    if (!fieldSchema) {
      continue;
    }

    if (fieldValue === null && isNullishSchema(fieldSchema)) {
      if (!indexes.includes(fieldKey)) {
        properties.push(`'${fieldKey}': null`);
      }

      // Avoid null indexes since DynamoDB doesn't allow it.
      continue;
    }

    const variable = await getWithSchemaValidation(fieldValue, fieldSchema, fieldKey);

    properties.push(`'${fieldKey}': ?`);
    variables.push(variable);
  }

  return [`{ ${properties.join(', ')} }`, variables];
};
