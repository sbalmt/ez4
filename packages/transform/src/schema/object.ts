import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { getPropertyName } from '@ez4/schema';
import { isAnyObject } from '@ez4/utils';

import { createTransformContext } from '../types/context.js';
import { transformAny } from './any.js';

export const transformObject = (value: unknown, schema: ObjectSchema, context = createTransformContext()) => {
  if (value === null || value === undefined || !isAnyObject(value)) {
    return schema.definitions?.default;
  }

  const output: AnyObject = {};

  if (schema.identity) {
    context.references[schema.identity] = schema;
  }

  const allProperties = new Set(Object.keys(value));

  for (const propertyKey in schema.properties) {
    const propertyName = getPropertyName(propertyKey, context.namingStyle);
    const propertySchema = schema.properties[propertyKey];

    const rawValue = value[propertyName];
    const newValue = transformAny(rawValue, propertySchema, context);

    if (newValue !== undefined) {
      output[propertySchema.alias ?? propertyName] = newValue;
    }

    allProperties.delete(propertyName);
  }

  if (schema.additional) {
    const { value: propertySchema } = schema.additional;

    for (const propertyKey of allProperties) {
      const propertyName = getPropertyName(propertyKey, context.namingStyle);

      const rawValue = value[propertyName];
      const newValue = transformAny(rawValue, propertySchema, context);

      if (newValue !== undefined) {
        allProperties.delete(propertyName);

        output[propertyName] = newValue;
      }
    }
  }

  const allowExtraProperties = schema.definitions?.extensible;

  if (allowExtraProperties) {
    for (const propertyKey of allProperties) {
      const propertyName = getPropertyName(propertyKey, context.namingStyle);

      output[propertyName] = value[propertyName];
    }
  }

  return output;
};
