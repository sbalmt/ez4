import type { BooleanSchema } from '@ez4/schema';
import type { ValidationContext } from '../types/context';

import { isAnyBoolean, isNotNullish } from '@ez4/utils';

import { ExpectedBooleanTypeError, UnexpectedBooleanError } from '../errors/boolean';
import { useCustomValidation } from '../utils/custom';
import { isNullishAllowed } from '../utils/nullish';

const isDefaultAllowed = (value: unknown, schema: BooleanSchema) => {
  return value === undefined && isNotNullish(schema.definitions?.default);
};

export const validateBoolean = (value: unknown, schema: BooleanSchema, context?: ValidationContext) => {
  if (isNullishAllowed(value, schema) || isDefaultAllowed(value, schema)) {
    return [];
  }

  const property = context?.property;

  if (typeof value !== 'boolean') {
    return [new ExpectedBooleanTypeError(property)];
  }

  const { definitions } = schema;

  if (isAnyBoolean(definitions?.value) && value !== definitions?.value) {
    return [new UnexpectedBooleanError(definitions.value, property)];
  }

  if (definitions?.types && context) {
    return useCustomValidation(value, schema, definitions.types, context);
  }

  return [];
};
