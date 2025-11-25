import type { ReferenceSchema } from '@ez4/schema';

export const getReferenceSchemaOutput = (schema: ReferenceSchema) => {
  return [`$ref: '#/components/entitySchemes/${schema.identity}'`];
};
