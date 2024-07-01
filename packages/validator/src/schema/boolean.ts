import type { BooleanSchema } from '@ez4/schema';

import { ExpectedBooleanTypeError } from '../errors/boolean.js';
import { isOptionalNullable } from './utils.js';

export const validateBoolean = (value: unknown, schema: BooleanSchema, property?: string) => {
  if (!isOptionalNullable(value, schema) && typeof value !== 'boolean') {
    return [new ExpectedBooleanTypeError(property)];
  }

  return [];
};
