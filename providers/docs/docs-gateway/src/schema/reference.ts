import type { ReferenceSchema } from '@ez4/schema';

export const getReferenceSchemaOutput = (schema: ReferenceSchema) => {
  return [`$ref: "entity${schema.identity}"`];
};
