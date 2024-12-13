import type { ArraySchema } from '@ez4/schema';

import { getNewContext } from '../types/context.js';
import { transformAny } from './any.js';

export const transformArray = (value: unknown, schema: ArraySchema, context = getNewContext()) => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const output = [];

  for (const elementValue of value) {
    output.push(transformAny(elementValue, schema.element, context));
  }

  return output;
};
