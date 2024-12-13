import type { UnionSchema } from '@ez4/schema';

import { getNewContext } from '../types/context.js';
import { transformAny } from './any.js';

export const transformUnion = (value: unknown, schema: UnionSchema, context = getNewContext()) => {
  for (const elementSchema of schema.elements) {
    const result = transformAny(value, elementSchema, context);

    if (result !== undefined) {
      return result;
    }
  }

  return undefined;
};
