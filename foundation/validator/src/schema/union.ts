import type { UnionSchema } from '@ez4/schema';

import { createValidatorContext } from '../types/context';
import { useCustomValidation } from '../utils/custom';
import { isNullish } from '../utils/nullish';
import { validateAny } from './any';

export const validateUnion = async (value: unknown, schema: UnionSchema, context = createValidatorContext()) => {
  if (isNullish(value, schema)) {
    return [];
  }

  let lastErrorList: Error[] = [];
  let lastErrorSize = +Infinity;

  const { definitions, elements } = schema;

  for (const elementSchema of elements) {
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

  if (!lastErrorList.length && definitions?.custom && context) {
    return useCustomValidation(value, schema, context);
  }

  return lastErrorList;
};
