import type { ArraySchema } from '@ez4/schema';

import { isAnyNumber } from '@ez4/utils';

import { createValidatorContext } from '../types/context.js';
import { ExpectedArrayTypeError, UnexpectedMaxItemsError, UnexpectedMinItemsError } from '../errors/array.js';
import { isNullish } from '../utils/nullish.js';
import { validateAny } from './any.js';

export const validateArray = async (value: unknown, schema: ArraySchema, context = createValidatorContext()) => {
  if (isNullish(value, schema)) {
    return [];
  }

  const { property, references, depth } = context;

  if (!(value instanceof Array)) {
    return [new ExpectedArrayTypeError(property)];
  }

  const allErrors: Error[] = [];

  const { definitions } = schema;

  if (isAnyNumber(definitions?.minLength) && value.length < definitions.minLength) {
    allErrors.push(new UnexpectedMinItemsError(definitions.minLength, property));
  }

  if (isAnyNumber(definitions?.maxLength) && value.length > definitions.maxLength) {
    allErrors.push(new UnexpectedMaxItemsError(definitions.maxLength, property));
  }

  if (depth > 0) {
    let index = 0;

    for (const elementValue of value) {
      const elementProperty = `${property}.${index++}`;
      const elementSchema = schema.element;

      const errorList = await validateAny(elementValue, elementSchema, {
        namingStyle: context.namingStyle,
        property: elementProperty,
        depth: depth - 1,
        references
      });

      allErrors.push(...errorList);
    }
  }

  return allErrors;
};
