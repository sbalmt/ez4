import type { ArraySchema } from '@ez4/schema';

import { isAnyNumber } from '@ez4/utils';

import { tryDecodeBase64Json } from '../utils/base64';
import { ExpectedArrayTypeError, UnexpectedMaxItemsError, UnexpectedMinItemsError } from '../errors/array';
import { createValidatorContext } from '../types/context';
import { isNullish } from '../utils/nullish';
import { validateAny } from './any';

export const validateArray = async (value: unknown, schema: ArraySchema, context = createValidatorContext()) => {
  if (isNullish(value, schema)) {
    return [];
  }

  const { property, references, depth } = context;
  const { definitions } = schema;

  const arrayValues = definitions?.encoded ? tryDecodeBase64Json(value) : value;

  if (!(arrayValues instanceof Array)) {
    return [new ExpectedArrayTypeError(property)];
  }

  const allErrors: Error[] = [];

  if (isAnyNumber(definitions?.minLength) && arrayValues.length < definitions.minLength) {
    allErrors.push(new UnexpectedMinItemsError(definitions.minLength, property));
  }

  if (isAnyNumber(definitions?.maxLength) && arrayValues.length > definitions.maxLength) {
    allErrors.push(new UnexpectedMaxItemsError(definitions.maxLength, property));
  }

  if (depth > 0) {
    let index = 0;

    for (const elementValue of arrayValues) {
      const elementProperty = `${property}.${index++}`;
      const elementSchema = schema.element;

      const errorList = await validateAny(elementValue, elementSchema, {
        inputStyle: context.inputStyle,
        property: elementProperty,
        depth: depth - 1,
        references
      });

      allErrors.push(...errorList);
    }
  }

  return allErrors;
};
