import type { AnySchema } from '../types/type-any.js';

import { isObjectSchema } from '../types/type-object.js';
import { isUnionSchema } from '../types/type-union.js';

export const hasSchemaProperty = (schema: AnySchema, property: string): boolean => {
  if (isObjectSchema(schema)) {
    return !!schema.properties[property];
  }

  if (isUnionSchema(schema)) {
    return schema.elements.some((schema) => hasSchemaProperty(schema, property));
  }

  return false;
};
