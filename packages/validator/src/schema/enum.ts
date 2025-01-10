import type { EnumSchema } from '@ez4/schema';
import type { ValidationContext } from '../types/context.js';

import { UnexpectedEnumValueError } from '../errors/enum.js';
import { isOptionalNullable } from './utils.js';

export const validateEnum = (value: unknown, schema: EnumSchema, context?: ValidationContext) => {
  if (isOptionalNullable(value, schema)) {
    return [];
  }

  for (const enumOption of schema.options) {
    if (value === enumOption.value) {
      return [];
    }
  }

  return [new UnexpectedEnumValueError(schema.options, context?.property)];
};
