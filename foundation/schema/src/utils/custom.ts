import type { AnySchema } from '@ez4/schema';

import { isArraySchema, isObjectSchema, isTupleSchema, isUnionSchema } from '@ez4/schema';

export const getSchemaCustomValidation = (schema: AnySchema) => {
  const validations = new Set<string>();

  const collectCustomValidation = (schema: AnySchema) => {
    if (schema.definitions?.types) {
      schema.definitions.types.forEach((type) => validations.add(type));
    }

    if (isObjectSchema(schema)) {
      for (const propertyName in schema.properties) {
        collectCustomValidation(schema.properties[propertyName]);
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

  return [...validations];
};
