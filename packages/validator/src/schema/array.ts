import type { ArraySchema } from '@ez4/schema';

import { isAnyNumber } from '@ez4/utils';

import {
  ExpectedArrayTypeError,
  UnexpectedMaxItemsError,
  UnexpectedMinItemsError
} from '../errors/array.js';

import { getNewContext } from '../types/context.js';
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

  const { definitions } = schema;

  if (isAnyNumber(definitions?.minLength) && value.length < definitions.minLength) {
    allErrors.push(new UnexpectedMinItemsError(definitions.minLength, property));
  } else if (isAnyNumber(definitions?.maxLength) && value.length > definitions.maxLength) {
    allErrors.push(new UnexpectedMaxItemsError(definitions.maxLength, property));
  }

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
