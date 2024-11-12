import type { Database, Relations, Query } from '@ez4/database';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { ObjectSchema } from '@ez4/schema';
import type { RepositoryRelations } from '../../types/repository.js';

import { prepareFieldData } from './data.js';

type PrepareResult = [string, SqlParameter[]];

export const prepareInsertQuery = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelations,
  query: Query.InsertOneInput<T, I, R>
): PrepareResult => {
  const [insertFields, insertParameters, variables] = prepareInsertFields(
    query.data,
    schema,
    relations
  );

  const statement = `INSERT INTO "${table}" ${insertFields} VALUES ${insertParameters}`;

  return [statement, variables];
};

const prepareInsertFields = <T extends Database.Schema>(
  data: T,
  schema: ObjectSchema,
  relations: RepositoryRelations
): [string, ...PrepareResult] => {
  const properties: string[] = [];
  const variables: SqlParameter[] = [];

  for (const fieldKey in data) {
    const fieldValue = data[fieldKey];
    const fieldRelation = relations[fieldKey];

    if (fieldValue === undefined || fieldRelation) {
      continue;
    }

    const fieldSchema = schema.properties[fieldKey];

    if (!fieldSchema) {
      throw new Error(`Field schema for ${fieldKey} doesn't exists.`);
    }

    const fieldName = `i${properties.length}`;
    const fieldData = prepareFieldData(fieldName, fieldValue, fieldSchema);

    properties.push(`"${fieldKey}"`);
    variables.push(fieldData);
  }

  return [
    `(${properties.join(', ')})`,
    `(${properties.map((_, index) => `:i${index}`).join(', ')})`,
    variables
  ];
};
