import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { base64Encode, isAnyObject } from '@ez4/utils';
import { getPropertyName } from '@ez4/schema';

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
  const localContext = { ...context, convert };

  const allProperties = new Set(Object.keys(objectValue));
  const output: AnyObject = {};

  let complete = true;

  for (const propertyKey in schema.properties) {
    const propertySchema = schema.properties[propertyKey];
    const propertyName = getPropertyName(propertyKey, inputStyle);

    const rawValue = objectValue[propertyName];
    const newValue = transformAny(rawValue, propertySchema, localContext);

    const outputPropertyName = propertySchema.alias ?? getPropertyName(propertyKey, outputStyle);

    allProperties.delete(propertyName);

    if (newValue !== undefined) {
      output[outputPropertyName] = newValue;
      continue;
    }

    if (!propertySchema.optional) {
      complete = false;
    }
  }

  if (!complete && !context.return) {
    return undefined;
  }

  const allowExtraProperties = definitions?.extensible;
  const preservePropertyName = definitions?.preserve;

  if (schema.additional) {
    const { value: propertySchema } = schema.additional;

    for (const propertyKey of allProperties) {
      const rawValue = objectValue[propertyKey];
      const newValue = transformAny(rawValue, propertySchema, localContext);

      if (newValue !== undefined) {
        const outputPropertyName = preservePropertyName ? propertyKey : getPropertyName(propertyKey, outputStyle);

        output[outputPropertyName] = newValue;

        allProperties.delete(propertyKey);
      }
    }
  }

  if (allowExtraProperties) {
    for (const propertyKey of allProperties) {
      const outputPropertyName = preservePropertyName ? propertyKey : getPropertyName(propertyKey, outputStyle);

      output[outputPropertyName] = objectValue[propertyKey];
    }
  }

  if (definitions?.encoded && isAnyObject(value)) {
    return base64Encode(JSON.stringify(output));
  }

  return output;
};
