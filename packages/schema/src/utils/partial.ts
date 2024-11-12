import type { ObjectSchema, ObjectSchemaProperties } from '../types/object.js';

import { SchemaTypeName } from '../types/common.js';

export type PartialObjectSchemaProperties = {
  [property: string]: PartialObjectSchemaProperties | boolean;
};

export type PartialObjectSchemaOptions = {
  extensible?: boolean;
  include: PartialObjectSchemaProperties;
};

export const partialObjectSchema = (
  schema: ObjectSchema,
  options: PartialObjectSchemaOptions
): ObjectSchema => {
  const properties: ObjectSchemaProperties = {};

  const { extensible, include } = options;

  for (const propertyName in schema.properties) {
    const propertyState = include[propertyName];

    if (!propertyState) {
      continue;
    }

    const value = schema.properties[propertyName];

    if (value.type !== SchemaTypeName.Object || !(propertyState instanceof Object)) {
      properties[propertyName] = value;
      continue;
    }

    properties[propertyName] = partialObjectSchema(value, {
      include: propertyState,
      extensible
    });
  }

  return {
    type: SchemaTypeName.Object,
    properties,
    ...(extensible && {
      extra: {
        extensible: true
      }
    })
  };
};
