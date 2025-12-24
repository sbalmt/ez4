import type { AnySchema } from '@ez4/schema';

import { isArraySchema, isObjectSchema, isTupleSchema, isUnionSchema } from '@ez4/schema';

export const getSchemaCustomValidation = (schema: AnySchema) => {
  const validators = new Set<string>();

  const collectCustomValidation = (schema: AnySchema) => {
    if (schema.definitions?.type) {
      validators.add(schema.definitions.type);
    }

    if (isObjectSchema(schema)) {
      for (const property in schema.properties) {
        collectCustomValidation(schema.properties[property]);
      }
    }

    if (isTupleSchema(schema) || isUnionSchema(schema)) {
      for (const element of schema.elements) {
        collectCustomValidation(element);
      }
    }

    if (isArraySchema(schema)) {
      collectCustomValidation(schema.element);
    }
  };

  collectCustomValidation(schema);

  return [...validators];
};
