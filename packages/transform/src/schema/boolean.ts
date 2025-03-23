import type { BooleanSchema } from '@ez4/schema';

import { createTransformContext } from '../types/context.js';

export const transformBoolean = (value: unknown, schema: BooleanSchema, context = createTransformContext()) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (context.convert) {
    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }
  }

  return schema.definitions?.default;
};
