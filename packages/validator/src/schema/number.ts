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

    if (schema.minValue && value < schema.minValue) {
      return [new UnexpectedMinRangeError(schema.minValue, property)];
    }

    if (schema.maxValue && value > schema.maxValue) {
      return [new UnexpectedMaxRangeError(schema.maxValue, property)];
    }
  }

  return [];
};
