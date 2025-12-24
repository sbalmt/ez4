import type { BooleanSchema } from '@ez4/schema';
import type { ValidationContext } from '../types/context';

import { isAnyBoolean } from '@ez4/utils';

import { ExpectedBooleanTypeError, UnexpectedBooleanError } from '../errors/boolean';
import { useCustomValidation } from '../utils/custom';
import { isNullish } from '../utils/nullish';

export const validateBoolean = (value: unknown, schema: BooleanSchema, context?: ValidationContext) => {
  if (isNullish(value, schema)) {
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

  if (definitions?.type && context) {
    return useCustomValidation(value, schema, definitions.type, context);
  }

  return [];
};
