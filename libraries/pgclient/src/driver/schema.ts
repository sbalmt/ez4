import type { AnySchema } from '@ez4/schema';

import { isArraySchema, isObjectSchema, isTupleSchema, isUnionSchema } from '@ez4/schema';

export const isJsonFieldSchema = (schema: AnySchema) => {
  return isObjectSchema(schema) || isUnionSchema(schema) || isArraySchema(schema) || isTupleSchema(schema);
};
