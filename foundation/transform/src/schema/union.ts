import type { UnionSchema } from '@ez4/schema';

import { deepMerge, isAnyObject } from '@ez4/utils';

import { createTransformContext } from '../types/context';
import { transformAny } from './any';

export const transformUnion = (value: unknown, schema: UnionSchema, context = createTransformContext()) => {
  if (value === undefined) {
    return undefined;
  }

  let lastValue: unknown;

  for (const elementSchema of schema.elements) {
    const result = transformAny(value, elementSchema, {
      ...context,
      return: false
    });

    if (result === undefined) {
      continue;
    }

    if (isAnyObject(result) && isAnyObject(lastValue)) {
      lastValue = deepMerge(lastValue, result);
      continue;
    }

    if (!isAnyObject(result)) {
      return result;
    }

    lastValue = result;
  }

  if (lastValue === undefined && context.return) {
    return value;
  }

  return lastValue;
};
