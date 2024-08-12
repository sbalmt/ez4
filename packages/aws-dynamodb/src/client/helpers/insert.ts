import type { Database } from '@ez4/database';

export type PrepareInsertResult = [string, unknown[]];

export const prepareInsertFields = <T extends Database.Schema>(data: T): PrepareInsertResult => {
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
