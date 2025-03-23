import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { RepositoryRelations } from '../../types/repository.js';

import { isArraySchema, isObjectSchema, isTupleSchema, isUnionSchema } from '@ez4/schema';

export const parseRecord = <T extends Record<string, unknown>>(record: T, schema: ObjectSchema, relations: RepositoryRelations) => {
  const result: Record<string, unknown> = {};

  for (const fieldKey in record) {
    const value = record[fieldKey];

    if (typeof value === 'string') {
      const fieldSchema = schema.properties[fieldKey];

      if (fieldSchema && isJsonField(fieldSchema)) {
        result[fieldKey] = JSON.parse(value);
        continue;
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

const isJsonField = (schema: AnySchema) => {
  return isObjectSchema(schema) || isUnionSchema(schema) || isArraySchema(schema) || isTupleSchema(schema);
};
