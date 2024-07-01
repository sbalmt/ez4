import type { UnionSchema } from '@ez4/schema';

import { isOptionalNullable } from './utils.js';
import { validateAny } from './any.js';

export const validateUnion = async (value: unknown, schema: UnionSchema, property?: string) => {
  if (isOptionalNullable(value, schema)) {
    return [];
  }

  let lessErrors: Error[] | undefined;

  for (const elementSchema of schema.elements) {
    const errorList = await validateAny(value, elementSchema, property);

    if (!errorList.length) {
      return [];
    }

    // Union with less errors is the best fit.
    if (!lessErrors || lessErrors.length > errorList.length) {
      lessErrors = errorList;
    }
  }

  return lessErrors ?? [];
};
