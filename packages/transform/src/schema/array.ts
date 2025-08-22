import type { ArraySchema } from '@ez4/schema';

import { tryDecodeBase64Json } from '../utils/base64.js';
import { createTransformContext } from '../types/context.js';
import { stringToArray } from '../utils/array.js';
import { transformAny } from './any.js';

export const transformArray = (value: unknown, schema: ArraySchema, context = createTransformContext()): unknown[] | undefined => {
  const definitions = schema.definitions;

  const arrayValues = definitions?.encoded ? tryDecodeBase64Json(value) : value;

  if (context.convert && typeof arrayValues === 'string') {
    return transformArray(stringToArray(arrayValues), schema, context);
  }

  if (!Array.isArray(arrayValues)) {
    return definitions?.default;
  }

  const output = [];

  for (const elementValue of arrayValues) {
    output.push(transformAny(elementValue, schema.element, context));
  }

  return output;
};
