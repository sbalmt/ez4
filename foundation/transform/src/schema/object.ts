import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { getPropertyName } from '@ez4/schema';
import { isAnyObject } from '@ez4/utils';

import { tryDecodeBase64Json } from '../utils/base64';
import { createTransformContext } from '../types/context';
import { transformAny } from './any';

export const transformObject = (value: unknown, schema: ObjectSchema, context = createTransformContext()) => {
  const definitions = schema.definitions;

  if (value === undefined) {
    return definitions?.default;
  }

  const objectValue = definitions?.encoded ? tryDecodeBase64Json(value) : value;

  if (!isAnyObject(objectValue)) {
    return context.return ? value : undefined;
  }

  const { references, inputStyle, outputStyle } = context;

  if (schema.identity) {
    references[schema.identity] = schema;
  }

  const convert = definitions?.encoded ? false : context.convert;

  const allProperties = new Set(Object.keys(objectValue));
  const output: AnyObject = {};

  for (const propertyKey in schema.properties) {
    const propertySchema = schema.properties[propertyKey];
    const propertyName = getPropertyName(propertyKey, inputStyle);

    const rawValue = objectValue[propertyName];

    const newValue = transformAny(rawValue, propertySchema, {
      ...context,
      convert
    });

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

      const newValue = transformAny(rawValue, propertySchema, {
        ...context,
        convert
      });

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
