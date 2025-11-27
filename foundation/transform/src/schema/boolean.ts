import type { BooleanSchema } from '@ez4/schema';
import type { TransformContext } from '../types/context';

import { createTransformContext } from '../types/context';

export const transformBoolean = (value: unknown, schema: BooleanSchema, context = createTransformContext()) => {
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
