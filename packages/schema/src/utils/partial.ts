import type { ObjectSchema, ObjectSchemaProperties } from '../types/object.js';
import type { AnyObject } from '@ez4/utils';

import { isAnyObject } from '@ez4/utils';

import { SchemaType } from '../types/common.js';

export type PartialObjectSchemaProperties = {
  [property: string]: PartialObjectSchemaProperties | boolean;
};

export type PartialObjectSchemaOptions = {
  /**
   * Determines whether or not the new schema is extensible.
   */
  extensible?: boolean;

  /**
   * Determines which property must be excluded, all other properties are included.
   */
  exclude?: PartialObjectSchemaProperties;

  /**
   * Determines which property must be included, all other properties are excluded.
   */
  include?: PartialObjectSchemaProperties;
};

export const partialObjectSchema = (
  schema: ObjectSchema,
  options: PartialObjectSchemaOptions
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

    properties[propertyName] = partialObjectSchema(value, {
      ...(isInclude ? { include: propertyState } : { exclude: propertyState }),
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
