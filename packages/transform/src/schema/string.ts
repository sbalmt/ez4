import type { StringSchema } from '@ez4/schema';

import { createTransformContext } from '../types/context.js';

export const transformString = (value: unknown, schema: StringSchema, context = createTransformContext()) => {
  const { definitions } = schema;

  if (value === undefined) {
    return definitions?.default;
  }

  if (typeof value === 'string') {
    return definitions?.trim ? value.trim() : value;
  }

  const valueType = typeof value;

  if (context.convert && (valueType === 'number' || valueType === 'boolean')) {
    const input = String(value);

    if (definitions?.trim) {
      return input.trim();
    }

    return input;
  }

  if (!context.return) {
    return undefined;
  }

  return value;
};
