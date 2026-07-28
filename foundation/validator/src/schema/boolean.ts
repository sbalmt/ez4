import type { BooleanSchema } from '@ez4/schema';
import type { ValidationContext } from '../types/context';

import { isAnyBoolean, isAnyString, isNotNullish } from '@ez4/utils';

import { ExpectedBooleanTypeError, UnexpectedBooleanError } from '../errors/boolean';
import { useCustomValidation } from '../utils/custom';
import { isNullishAllowed } from '../utils/nullish';

const isDefaultAllowed = (value: unknown, schema: BooleanSchema) => {
  return value === undefined && isNotNullish(schema.definitions?.default);
};

const getValidationInput = (value: unknown, context?: ValidationContext) => {
  if (!isAnyString(value) || !context?.cast) {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return value;
};

export const validateBoolean = (value: unknown, schema: BooleanSchema, context?: ValidationContext) => {
  if (isNullishAllowed(value, schema) || isDefaultAllowed(value, schema)) {
    return [];
  }

  const input = getValidationInput(value, context);
  const property = context?.property;

  if (!isAnyBoolean(input)) {
    return [new ExpectedBooleanTypeError(value, property)];
  }

  const { definitions } = schema;

  if (isAnyBoolean(definitions?.value) && input !== definitions?.value) {
    return [new UnexpectedBooleanError(value, definitions.value, property)];
  }

  if (definitions?.types && context) {
    return useCustomValidation(input, schema, definitions.types, context);
  }

  return [];
};
