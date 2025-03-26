import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

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

  for (const propertyName in schema.properties) {
    allProperties.delete(propertyName);

    const valueSchema = schema.properties[propertyName];

    const rawValue = value[propertyName];
    const newValue = transformAny(rawValue, valueSchema, context);

    if (newValue !== undefined) {
      output[propertyName] = newValue;
    }
  }

  if (schema.additional) {
    const { value: valueSchema } = schema.additional;

    for (const propertyName of allProperties) {
      const rawValue = value[propertyName];
      const newValue = transformAny(rawValue, valueSchema, context);

      if (newValue !== undefined) {
        allProperties.delete(propertyName);

        output[propertyName] = newValue;
      }
    }
  }

  const allowExtraProperties = schema.definitions?.extensible;

  if (allowExtraProperties) {
    for (const propertyName of allProperties) {
      output[propertyName] = value[propertyName];
    }
  }

  return output;
};
