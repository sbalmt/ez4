import type { ArraySchema } from '@ez4/schema';

import { getNewContext } from '../types/context.js';
import { ExpectedArrayTypeError } from '../errors/array.js';
import { isOptionalNullable } from './utils.js';
import { validateAny } from './any.js';

export const validateArray = async (
  value: unknown,
  schema: ArraySchema,
  context = getNewContext()
) => {
  if (isOptionalNullable(value, schema)) {
    return [];
  }

  const { property, references } = context;

  if (!(value instanceof Array)) {
    return [new ExpectedArrayTypeError(property)];
  }

  const allErrors: Error[] = [];

  let index = 0;

  for (const elementValue of value) {
    const elementProperty = `${property}.${index++}`;
    const elementSchema = schema.element;

    const errorList = await validateAny(elementValue, elementSchema, {
      property: elementProperty,
      references
    });

    allErrors.push(...errorList);
  }

  return allErrors;
};
