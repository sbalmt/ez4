import type { UnionSchema } from '@ez4/schema';

import { isAnyObject, objectSize } from '@ez4/utils';

import { createTransformContext } from '../types/context';
import { transformAny } from './any';

export const transformUnion = (value: unknown, schema: UnionSchema, context = createTransformContext()) => {
  if (value === undefined) {
    return undefined;
  }

  const localContext = { ...context, return: false };

  let lastSize = -Infinity;
  let lastValue: unknown;

  for (const elementSchema of schema.elements) {
    localContext.partial = false;

    const result = transformAny(value, elementSchema, localContext);

    if (result === undefined) {
      continue;
    }

    if (isAnyObject(result)) {
      const size = objectSize(result);

      if (!localContext.partial && lastSize <= size) {
        lastValue = result;
      }

      continue;
    }

    return result;
  }

  if (lastValue === undefined && context.return) {
    return value;
  }

  context.partial = localContext.partial;

  return lastValue;
};
