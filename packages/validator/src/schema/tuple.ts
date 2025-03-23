import type { TupleSchema } from '@ez4/schema';

import { createValidatorContext } from '../types/context.js';
import { ExpectedTupleTypeError } from '../errors/tuple.js';
import { isOptionalNullable } from './utils.js';
import { validateAny } from './any.js';

export const validateTuple = async (value: unknown, schema: TupleSchema, context = createValidatorContext()) => {
  if (isOptionalNullable(value, schema)) {
    return [];
  }

  const { property, references } = context;

  if (!(value instanceof Array)) {
    return [new ExpectedTupleTypeError(property)];
  }

  const allErrors: Error[] = [];

  let index = 0;

  for (const elementSchema of schema.elements) {
    const elementProperty = `${property}.${index}`;
    const elementValue = value[index++];

    const errorList = await validateAny(elementValue, elementSchema, {
      property: elementProperty,
      references
    });

    allErrors.push(...errorList);
  }

  return allErrors;
};
