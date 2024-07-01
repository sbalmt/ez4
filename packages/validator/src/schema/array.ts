import type { ArraySchema } from '@ez4/schema';

import { ExpectedArrayTypeError } from '../errors/array.js';
import { isOptionalNullable } from './utils.js';
import { validateAny } from './any.js';

export const validateArray = async (value: unknown, schema: ArraySchema, property?: string) => {
  if (isOptionalNullable(value, schema)) {
    return [];
  }

  if (!(value instanceof Array)) {
    return [new ExpectedArrayTypeError(property)];
  }

  const allErrors: Error[] = [];

  let index = 0;

  for (const elementValue of value) {
    const elementProperty = `${property}.${index++}`;
    const elementSchema = schema.element;

    const errorList = await validateAny(elementValue, elementSchema, elementProperty);

    allErrors.push(...errorList);
  }

  return allErrors;
};
