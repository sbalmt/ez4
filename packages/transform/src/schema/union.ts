import type { UnionSchema } from '@ez4/schema';

import { createTransformContext } from '../types/context.js';
import { transformAny } from './any.js';

export const transformUnion = (value: unknown, schema: UnionSchema, context = createTransformContext()) => {
  if (value !== null && value !== undefined) {
    for (const elementSchema of schema.elements) {
      const result = transformAny(value, elementSchema, context);

      if (result !== undefined) {
        return result;
      }
    }
  }

  return undefined;
};
