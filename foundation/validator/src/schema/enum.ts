import type { EnumSchema } from '@ez4/schema';
import type { ValidationContext } from '../types/context';

import { UnexpectedEnumValueError } from '../errors/enum';
import { isNullish } from '../utils/nullish';

export const validateEnum = (value: unknown, schema: EnumSchema, context?: ValidationContext) => {
  if (isNullish(value, schema)) {
    return [];
  }

  for (const enumOption of schema.options) {
    if (value === enumOption.value) {
      return [];
    }
  }

  return [new UnexpectedEnumValueError(schema.options, context?.property)];
};
