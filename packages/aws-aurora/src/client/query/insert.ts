import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { Database, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { prepareFieldData } from './data.js';

type PrepareResult = [string, SqlParameter[]];

export const prepareInsert = <T extends Database.Schema>(
  table: string,
  schema: ObjectSchema,
  query: Query.InsertOneInput<T>
): PrepareResult => {
  const [insertFields, insertParameters, insertVariables] = prepareInsertFields(query.data, schema);

  const statement = `INSERT INTO "${table}" ${insertFields} VALUES ${insertParameters}`;

  return [statement, insertVariables];
};

const prepareInsertFields = <T extends Database.Schema>(
  data: T,
  schema: ObjectSchema
): [string, ...PrepareResult] => {
  const properties: string[] = [];
  const variables: SqlParameter[] = [];

  for (const fieldKey in data) {
    const fieldSchema = schema.properties[fieldKey];
    const fieldValue = data[fieldKey];

    if (fieldValue === undefined) {
      continue;
    }

    if (!fieldSchema) {
      throw new Error(`Field schema for ${fieldKey} doesn't exists.`);
    }

    const fieldData = prepareFieldData(fieldValue, fieldSchema);

    properties.push(`"${fieldKey}"`);
    variables.push(fieldData);
  }

  return [`(${properties.join(', ')})`, `(${properties.map(() => '?').join(', ')})`, variables];
};
