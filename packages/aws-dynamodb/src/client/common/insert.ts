import type { Database, Query } from '@ez4/database';

type PrepareResult = [string, unknown[]];

export const prepareInsert = <T extends Database.Schema>(
  table: string,
  query: Query.InsertOneInput<T>
): PrepareResult => {
  const [insertFields, insertVariables] = prepareInsertFields(query.data);

  const statement = `INSERT INTO "${table}" value ${insertFields}`;

  return [statement, insertVariables];
};

const prepareInsertFields = <T extends Database.Schema>(data: T): PrepareResult => {
  const properties: string[] = [];
  const variables: unknown[] = [];

  for (const fieldKey in data) {
    const fieldValue = data[fieldKey];

    if (fieldValue === undefined) {
      continue;
    }

    properties.push(`'${fieldKey}': ?`);
    variables.push(fieldValue);
  }

  return [`{ ${properties.join(', ')} }`, variables];
};
