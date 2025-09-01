import type { BooleanSchema } from '@ez4/schema';

import { createTransformContext } from '../types/context';

export const transformBoolean = (value: unknown, schema: BooleanSchema, context = createTransformContext()) => {
  if (value === undefined) {
    return schema.definitions?.default;
  }

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

  if (!context.return) {
    return undefined;
  }

  return value;
};
