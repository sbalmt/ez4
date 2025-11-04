import type { UnionSchema } from '@ez4/schema';

import { arraySize, isAnyArray, isAnyObject, objectSize } from '@ez4/utils';

import { createTransformContext } from '../types/context';
import { transformAny } from './any';

export const transformUnion = (value: unknown, schema: UnionSchema, context = createTransformContext()) => {
  if (value === undefined) {
    return undefined;
  }

  let lastValue: unknown;
  let lastSize = -Infinity;

  const localContext = {
    ...context,
    return: false
  };

  for (const elementSchema of schema.elements) {
    const result = transformAny(value, elementSchema, localContext);

    if (result === undefined) {
      continue;
    }

    if (isAnyObject(result)) {
      const size = objectSize(result);

      if (size > lastSize) {
        lastValue = result;
        lastSize = size;
      }

      continue;
    }

    if (isAnyArray(result)) {
      const size = arraySize(result);

      if (size > lastSize) {
        lastValue = result;
        lastSize = size;
      }

      continue;
    }

    if (lastSize < 1) {
      lastValue = result;
      lastSize = 1;
    }
  }

  if (lastValue === undefined && context.return) {
    return value;
  }

  return lastValue;
};
