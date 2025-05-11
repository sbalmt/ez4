import type { BooleanSchema } from '@ez4/schema';
import type { ValidationContext } from '../types/context.js';

import { isAnyBoolean } from '@ez4/utils';

import { ExpectedBooleanTypeError, UnexpectedBooleanError } from '../errors/boolean.js';
import { isOptionalNullable } from './utils.js';

export const validateBoolean = (value: unknown, schema: BooleanSchema, context?: ValidationContext) => {
  if (isOptionalNullable(value, schema)) {
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

  return [];
};
