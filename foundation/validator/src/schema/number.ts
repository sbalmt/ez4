import type { NumberSchema } from '@ez4/schema';
import type { ValidationContext } from '../types/context';

import { isAnyNumber } from '@ez4/utils';

import {
  ExpectedIntegerTypeError,
  ExpectedNumberTypeError,
  UnexpectedMaxRangeError,
  UnexpectedMinRangeError,
  UnexpectedNumberError
} from '../errors/number';

import { isNullish } from '../utils/nullish';

export const validateNumber = (value: unknown, schema: NumberSchema, context?: ValidationContext) => {
  if (isNullish(value, schema)) {
    return [];
  }

  const property = context?.property;

  if (typeof value !== 'number' || Number.isNaN(value)) {
    return [new ExpectedNumberTypeError(property)];
  }

  if (schema.format === 'integer' && !Number.isSafeInteger(value)) {
    return [new ExpectedIntegerTypeError(property)];
  }

  const { definitions } = schema;

  if (isAnyNumber(definitions?.value) && value !== definitions?.value) {
    return [new UnexpectedNumberError(definitions.value, property)];
  }

  if (isAnyNumber(definitions?.minValue) && value < definitions.minValue) {
    return [new UnexpectedMinRangeError(definitions.minValue, property)];
  }

  if (isAnyNumber(definitions?.maxValue) && value > definitions.maxValue) {
    return [new UnexpectedMaxRangeError(definitions.maxValue, property)];
  }

  return [];
};
