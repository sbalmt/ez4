import type { NumberSchema } from '@ez4/schema';

import {
  ExpectedIntegerTypeError,
  ExpectedNumberTypeError,
  UnexpectedMaxRangeError,
  UnexpectedMinRangeError
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

    if (extra?.minValue && value < extra.minValue) {
      return [new UnexpectedMinRangeError(extra.minValue, property)];
    }

    if (extra?.maxValue && value > extra.maxValue) {
      return [new UnexpectedMaxRangeError(extra.maxValue, property)];
    }
  }

  return [];
};
