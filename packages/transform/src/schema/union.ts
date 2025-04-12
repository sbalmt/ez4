import type { UnionSchema } from '@ez4/schema';

import { deepMerge, isAnyObject } from '@ez4/utils';

import { createTransformContext } from '../types/context.js';
import { transformAny } from './any.js';

export const transformUnion = (value: unknown, schema: UnionSchema, context = createTransformContext()) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  let lastValue: unknown;

  for (const elementSchema of schema.elements) {
    const result = transformAny(value, elementSchema, context);

    if (result !== undefined) {
      if (isAnyObject(result) && isAnyObject(lastValue)) {
        lastValue = deepMerge(lastValue, result);
      } else if (lastValue === undefined) {
        lastValue = result;
      }
    }
  }

  return lastValue;
};
