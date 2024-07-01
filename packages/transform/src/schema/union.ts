import type { UnionSchema } from '@ez4/schema';

import { transformAny } from './any.js';

export const transformUnion = (value: unknown, schema: UnionSchema) => {
  for (const elementSchema of schema.elements) {
    const result = transformAny(value, elementSchema);

    if (result !== undefined) {
      return result;
    }
  }

  return undefined;
};
