import type { NumberSchema } from '@ez4/schema';

import { createTransformContext } from '../types/context.js';

export const transformNumber = (value: unknown, schema: NumberSchema, context = createTransformContext()) => {
  if (value === undefined) {
    return schema.definitions?.default;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (context.convert && typeof value === 'string') {
    const input = Number(value);

    if (!Number.isNaN(input) && Number.isFinite(input)) {
      return input;
    }
  }

  if (!context.return) {
    return undefined;
  }

  return value;
};
