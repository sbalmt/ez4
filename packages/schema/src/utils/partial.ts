import type { ObjectSchema, ObjectSchemaProperties } from '../types/type-object.js';
import type { AnyObject } from '@ez4/utils';

import { isAnyObject } from '@ez4/utils';

import { isObjectSchema } from '../types/type-object.js';
import { SchemaType } from '../types/common.js';

export type PartialSchemaProperties = {
  [property: string]: PartialSchemaProperties | boolean;
};

export type PartialSchemaOptions = {
  /**
   * Determines whether or not the new schema is extensible.
   */
  extensible?: boolean;

  /**
   * Determines which property must be excluded, all other properties are included.
   */
  exclude?: PartialSchemaProperties;

  /**
   * Determines which property must be included, all other properties are excluded.
   */
  include?: PartialSchemaProperties;
};

export const getPartialSchema = (
  schema: ObjectSchema,
  options: PartialSchemaOptions
): ObjectSchema => {
  const properties: ObjectSchemaProperties = {};

  const includeStates = (options as AnyObject)?.include;
  const excludeStates = (options as AnyObject)?.exclude;

  if (includeStates && excludeStates) {
    throw new TypeError(`Can't specify include and exclude options together.`);
  }

  const isInclude = !!includeStates;
  const allStates = includeStates ?? excludeStates ?? {};

  for (const propertyName in schema.properties) {
    const propertyState = allStates[propertyName];

    if ((isInclude && !propertyState) || (!isInclude && propertyState === true)) {
      continue;
    }

    const value = schema.properties[propertyName];

    if (value.type !== SchemaType.Object || !isAnyObject(propertyState)) {
      properties[propertyName] = value;
      continue;
    }

    properties[propertyName] = getPartialSchema(value, {
      ...(isInclude ? { include: propertyState } : { exclude: propertyState }),
      extensible: options.extensible
    });
  }

  return {
    type: SchemaType.Object,
    identity: schema.identity,
    properties,
    ...(options.extensible && {
      definitions: {
        extensible: true
      }
    })
  };
};

export const getPartialSchemaProperties = (schema: ObjectSchema) => {
  const properties: Record<string, unknown> = {};

  for (const propertyName in schema.properties) {
    const value = schema.properties[propertyName];

    if (isObjectSchema(value) && !value.definitions?.extensible) {
      properties[propertyName] = getPartialSchemaProperties(value);
    } else {
      properties[propertyName] = true;
    }
  }

  return properties;
};
