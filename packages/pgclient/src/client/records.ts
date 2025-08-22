import type { PgRelationRepository } from '@ez4/pgclient/library';
import type { ObjectSchema } from '@ez4/schema';

import { isAnyString, isEmptyObject } from '@ez4/utils';
import { isNumberSchema } from '@ez4/schema';

import { isJsonFieldSchema } from './schema.js';

export const parseRecords = <T extends Record<string, unknown>>(records: T[], schema: ObjectSchema, relations: PgRelationRepository) => {
  return records.map((record) => {
    if (!isEmptyObject(record)) {
      return parseRecord(record, schema, relations);
    }

    return undefined;
  });
};

export const parseRecord = <T extends Record<string, unknown>>(record: T, schema: ObjectSchema, relations: PgRelationRepository) => {
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

      if (relations[fieldKey]) {
        result[fieldKey] = JSON.parse(value);
        continue;
      }
    }

    result[fieldKey] = value;
  }

  return result as T;
};
