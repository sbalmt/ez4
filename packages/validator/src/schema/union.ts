import type { UnionSchema } from '@ez4/schema';

import { isNullish } from '../utils/nullish.js';
import { createValidatorContext } from '../types/context.js';
import { validateAny } from './any.js';

export const validateUnion = async (value: unknown, schema: UnionSchema, context = createValidatorContext()) => {
  if (isNullish(value, schema)) {
    return [];
  }

  let lastErrorList: Error[] = [];
  let lastErrorSize = +Infinity;

  for (const elementSchema of schema.elements) {
    const errorList = await validateAny(value, elementSchema, context);
    const errorSize = errorList.length;

    if (errorSize === 0) {
      return [];
    }

    if (errorSize === lastErrorSize) {
      lastErrorList.push(...errorList);
      continue;
    }

    if (lastErrorSize > errorSize) {
      lastErrorList = errorList;
      lastErrorSize = errorSize;
    }
  }

  return lastErrorList;
};
