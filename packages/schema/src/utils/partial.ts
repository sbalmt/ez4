import type { ObjectSchema, ObjectSchemaProperties } from '../types/object.js';

import { SchemaTypeName } from '../types/common.js';

export type PartialObjectSchemaProperties = {
  [x: string]: PartialObjectSchemaProperties | boolean;
};

export const partialObjectSchema = (
  schema: ObjectSchema,
  include: PartialObjectSchemaProperties
) => {
  const properties: ObjectSchemaProperties = {};

  for (const propertyName in schema.properties) {
    const propertyState = include[propertyName];

    if (!propertyState) {
      continue;
    }

    const value = schema.properties[propertyName];

    if (value.type === SchemaTypeName.Object && propertyState instanceof Object) {
      properties[propertyName] = partialObjectSchema(value, propertyState);
    } else {
      properties[propertyName] = value;
    }
  }

  return {
    ...schema,
    properties
  };
};
