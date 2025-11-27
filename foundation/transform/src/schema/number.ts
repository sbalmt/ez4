import type { NumberSchema } from '@ez4/schema';
import type { TransformContext } from '../types/context';

import { createTransformContext } from '../types/context';

export const transformNumber = (value: unknown, schema: NumberSchema, context = createTransformContext()) => {
  const { definitions } = schema;

  if (value === undefined) {
    return definitions?.default;
  }

  const result = getBooleanValue(value, context);

  if (definitions?.value !== undefined && definitions.value !== result && !context.return) {
    return undefined;
  }

  return result;
};

const getBooleanValue = (value: unknown, context: TransformContext) => {
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
