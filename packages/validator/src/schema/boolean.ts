import type { BooleanSchema } from '@ez4/schema';
import type { ValidationContext } from '../types/context.js';

import { ExpectedBooleanTypeError } from '../errors/boolean.js';
import { isOptionalNullable } from './utils.js';

export const validateBoolean = (value: unknown, schema: BooleanSchema, context?: ValidationContext) => {
  if (!isOptionalNullable(value, schema) && typeof value !== 'boolean') {
    return [new ExpectedBooleanTypeError(context?.property)];
  }

  return [];
};
