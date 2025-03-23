import type { ArraySchema } from '@ez4/schema';

import { createTransformContext } from '../types/context.js';
import { stringToArray } from '../utils/array.js';
import { transformAny } from './any.js';

export const transformArray = (value: unknown, schema: ArraySchema, context = createTransformContext()): unknown[] | undefined => {
  if (context.convert && typeof value === 'string') {
    return transformArray(stringToArray(value), schema, context);
  }

  if (!Array.isArray(value)) {
    return schema.definitions?.default;
  }

  const output = [];

  for (const elementValue of value) {
    output.push(transformAny(elementValue, schema.element, context));
  }

  return output;
};
