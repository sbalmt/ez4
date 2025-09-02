import type { PgStatementMetadata } from '../types/driver';

import { isAnyString, isEmptyObject } from '@ez4/utils';
import { isNumberSchema } from '@ez4/schema';

import { isJsonFieldSchema } from './schema';

export const parseRecords = <T extends Record<string, unknown>>(records: T[], metadata: PgStatementMetadata) => {
  return records.map((record) => {
    if (!isEmptyObject(record)) {
      return parseRecord(record, metadata);
    }

    return undefined;
  });
};

export const parseRecord = <T extends Record<string, unknown>>(record: T, metadata: PgStatementMetadata) => {
  const { table, schema, relations } = metadata;
  const result: Record<string, unknown> = {};

  for (const fieldKey in record) {
    const value = record[fieldKey];

    if (isAnyString(value)) {
      const fieldSchema = schema.properties[fieldKey];

      if (fieldSchema) {
        if (isJsonFieldSchema(fieldSchema)) {
          result[fieldKey] = JSON.parse(value);
          continue;
        }

        if (isNumberSchema(fieldSchema)) {
          result[fieldKey] = Number(value);
          continue;
        }
      }

      const relationPath = `${table}.${fieldKey}`;

      if (relations[relationPath]) {
        result[fieldKey] = JSON.parse(value);
        continue;
      }
    }

    result[fieldKey] = value;
  }

  return result as T;
};
