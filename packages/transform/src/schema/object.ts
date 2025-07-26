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

  const { inputStyle, outputStyle } = context;

  const allProperties = new Set(Object.keys(value));

  for (const propertyKey in schema.properties) {
    const propertyName = getPropertyName(propertyKey, inputStyle);
    const propertySchema = schema.properties[propertyKey];

    const rawValue = value[propertyName];
    const newValue = transformAny(rawValue, propertySchema, context);

    const outputPropertyName = propertySchema.alias ?? getPropertyName(propertyKey, outputStyle);

    if (newValue !== undefined) {
      output[outputPropertyName] = newValue;
    } else if (rawValue !== undefined) {
      output[outputPropertyName] = rawValue;
    }

    allProperties.delete(propertyName);
  }

  if (schema.additional) {
    const { value: propertySchema } = schema.additional;

    for (const propertyName of allProperties) {
      const rawValue = value[propertyName];
      const newValue = transformAny(rawValue, propertySchema, context);

      if (newValue !== undefined) {
        const outputPropertyName = getPropertyName(propertyName, outputStyle);

        output[outputPropertyName] = newValue;

        allProperties.delete(propertyName);
      }
    }
  }

  const allowExtraProperties = schema.definitions?.extensible;

  if (allowExtraProperties) {
    for (const propertyName of allProperties) {
      const outputPropertyName = getPropertyName(propertyName, outputStyle);

      output[outputPropertyName] = value[propertyName];
    }
  }

  return output;
};
