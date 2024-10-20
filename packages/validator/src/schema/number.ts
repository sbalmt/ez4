import type { NumberSchema } from '@ez4/schema';

import { isAnyNumber } from '@ez4/utils';

import {
  ExpectedIntegerTypeError,
  ExpectedNumberTypeError,
  UnexpectedMaxRangeError,
  UnexpectedMinRangeError,
  UnexpectedNumberError
} from '../errors/number.js';

import { isOptionalNullable } from './utils.js';

export const validateNumber = (value: unknown, schema: NumberSchema, property?: string) => {
  if (!isOptionalNullable(value, schema)) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return [new ExpectedNumberTypeError(property)];
    }

    if (schema.format === 'integer' && !Number.isSafeInteger(value)) {
      return [new ExpectedIntegerTypeError(property)];
    }

    const { extra } = schema;

    if (isAnyNumber(extra?.value) && value !== extra?.value) {
      return [new UnexpectedNumberError(extra.value, property)];
    }

    if (isAnyNumber(extra?.minValue) && value < extra.minValue) {
      return [new UnexpectedMinRangeError(extra.minValue, property)];
    }

    if (isAnyNumber(extra?.maxValue) && value > extra.maxValue) {
      return [new UnexpectedMaxRangeError(extra.maxValue, property)];
    }
  }

  return [];
};
