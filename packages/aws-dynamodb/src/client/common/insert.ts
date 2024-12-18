import type { Database, Relations, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

type PrepareResult = [string, unknown[]];

export const prepareInsert = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations
>(
  table: string,
  schema: ObjectSchema,
  query: Query.InsertOneInput<T, I, R>
): PrepareResult => {
  const [insertFields, variables] = prepareInsertFields(query.data, schema);

  const statement = `INSERT INTO "${table}" value ${insertFields}`;

  return [statement, variables];
};

const prepareInsertFields = <T extends Database.Schema>(
  data: T,
  schema: ObjectSchema
): PrepareResult => {
  const properties: string[] = [];
  const variables: unknown[] = [];

  for (const fieldKey in data) {
    const fieldValue = data[fieldKey];
    const fieldSchema = schema.properties[fieldKey];

    if (fieldValue === undefined) {
      continue;
    }

    if (!fieldSchema) {
      throw new Error(`Field schema for ${fieldKey} doesn't exists.`);
    }

    properties.push(`'${fieldKey}': ?`);

    variables.push(fieldValue);
  }

  return [`{ ${properties.join(', ')} }`, variables];
};
