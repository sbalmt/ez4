import type { ArraySchema } from '@ez4/schema';

import { transformAny } from './any.js';

export const transformArray = (value: unknown, schema: ArraySchema) => {
  if (!(value instanceof Array)) {
    return undefined;
  }

  const output = [];

  for (const elementValue of value) {
    output.push(transformAny(elementValue, schema.element));
  }

  return output;
};
