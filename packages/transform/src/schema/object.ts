import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { isAnyObject, isAnyString } from '@ez4/utils';
import { getPropertyName } from '@ez4/schema';

import { createTransformContext } from '../types/context.js';
import { transformAny } from './any.js';

export const transformObject = (value: unknown, schema: ObjectSchema, context = createTransformContext()) => {
  const definitions = schema.definitions;

  const objectValue = definitions?.encoded ? tryDecodeObject(value) : value;

  if (objectValue === null || objectValue === undefined || !isAnyObject(objectValue)) {
    return definitions?.default;
  }

  const { references, inputStyle, outputStyle } = context;

  if (schema.identity) {
    references[schema.identity] = schema;
  }

  const allProperties = new Set(Object.keys(objectValue));
  const output: AnyObject = {};

  for (const propertyKey in schema.properties) {
    const propertySchema = schema.properties[propertyKey];
    const propertyName = getPropertyName(propertyKey, inputStyle);

    const rawValue = objectValue[propertyName];
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
      const rawValue = objectValue[propertyName];
      const newValue = transformAny(rawValue, propertySchema, context);

      if (newValue !== undefined) {
        const outputPropertyName = getPropertyName(propertyName, outputStyle);

        output[outputPropertyName] = newValue;

        allProperties.delete(propertyName);
      }
    }
  }

  const allowExtraProperties = definitions?.extensible;

  if (allowExtraProperties) {
    for (const propertyName of allProperties) {
      const outputPropertyName = getPropertyName(propertyName, outputStyle);

      output[outputPropertyName] = objectValue[propertyName];
    }
  }

  return output;
};

const tryDecodeObject = (value: unknown) => {
  if (isAnyString(value)) {
    try {
      const decodedValue = Buffer.from(value, 'base64');
      return JSON.parse(decodedValue.toString('utf8'));
    } catch {}
  }

  return undefined;
};
