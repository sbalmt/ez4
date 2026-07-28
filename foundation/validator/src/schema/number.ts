import type { NumberSchema } from '@ez4/schema';
import type { ValidationContext } from '../types/context';

import { isAnyNumber, isAnyString, isNotNullish } from '@ez4/utils';

import {
  ExpectedIntegerTypeError,
  ExpectedNumberTypeError,
  UnexpectedMaxRangeError,
  UnexpectedMinRangeError,
  UnexpectedNumberError
} from '../errors/number';

import { useCustomValidation } from '../utils/custom';
import { isNullishAllowed } from '../utils/nullish';

const isDefaultAllowed = (value: unknown, schema: NumberSchema) => {
  return value === undefined && isNotNullish(schema.definitions?.default);
};

const getValidationInput = (value: unknown, context?: ValidationContext) => {
  return isAnyString(value) && context?.cast ? Number(value) : value;
};

export const validateNumber = (value: unknown, schema: NumberSchema, context?: ValidationContext) => {
  if (isNullishAllowed(value, schema) || isDefaultAllowed(value, schema)) {
    return [];
  }

  const input = getValidationInput(value, context);
  const property = context?.property;

  if (!isAnyNumber(input)) {
    return [new ExpectedNumberTypeError(value, property)];
  }

  if (schema.format === 'integer' && !Number.isSafeInteger(input)) {
    return [new ExpectedIntegerTypeError(value, property)];
  }

  const { definitions } = schema;

  if (isAnyNumber(definitions?.value) && input !== definitions?.value) {
    return [new UnexpectedNumberError(value, definitions.value, property)];
  }

  if (isAnyNumber(definitions?.minValue) && input < definitions.minValue) {
    return [new UnexpectedMinRangeError(value, definitions.minValue, property)];
  }

  if (isAnyNumber(definitions?.maxValue) && input > definitions.maxValue) {
    return [new UnexpectedMaxRangeError(value, definitions.maxValue, property)];
  }

  if (definitions?.types && context) {
    return useCustomValidation(input, schema, definitions.types, context);
  }

  return [];
};
