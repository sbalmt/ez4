import type { ObjectSchema, ObjectSchemaProperties } from '../types/object.js';

import { SchemaType } from '../types/common.js';

export type PartialObjectSchemaProperties = {
  [property: string]: PartialObjectSchemaProperties | boolean;
};

export type PartialObjectSchemaExcludeOptions = {
  extensible?: boolean;
  exclude: PartialObjectSchemaProperties;
};

export type PartialObjectSchemaIncludeOptions = {
  extensible?: boolean;
  include: PartialObjectSchemaProperties;
};

export type PartialObjectSchemaOptions =
  | PartialObjectSchemaIncludeOptions
  | PartialObjectSchemaExcludeOptions;

export const partialObjectSchema = (
  schema: ObjectSchema,
  options: PartialObjectSchemaOptions
): ObjectSchema => {
  const properties: ObjectSchemaProperties = {};

  const schemaInclude = 'include' in options;
  const schemaOptions = schemaInclude ? options.include : options.exclude;

  for (const propertyName in schema.properties) {
    const propertyState = schemaOptions[propertyName];

    if ((schemaInclude && !propertyState) || (!schemaInclude && propertyState === true)) {
      continue;
    }

    const value = schema.properties[propertyName];

    if (value.type !== SchemaType.Object || !(propertyState instanceof Object)) {
      properties[propertyName] = value;
      continue;
    }

    properties[propertyName] = partialObjectSchema(value, {
      ...(schemaInclude ? { include: propertyState } : { exclude: propertyState }),
      extensible: options.extensible
    });
  }

  return {
    type: SchemaType.Object,
    properties,
    ...(options.extensible && {
      extra: {
        extensible: true
      }
    })
  };
};
