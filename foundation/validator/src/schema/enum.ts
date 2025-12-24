import type { EnumSchema } from '@ez4/schema';
import type { ValidationContext } from '../types/context';

import { UnexpectedEnumValueError } from '../errors/enum';
import { useCustomValidation } from '../utils/custom';
import { isNullish } from '../utils/nullish';

export const validateEnum = (value: unknown, schema: EnumSchema, context?: ValidationContext) => {
  if (isNullish(value, schema)) {
    return [];
  }

  const { definitions } = schema;

  for (const enumOption of schema.options) {
    if (value === enumOption.value) {
      if (definitions?.type && context) {
        return useCustomValidation(value, schema, definitions.type, context);
      }

      return [];
    }
  }

  return [new UnexpectedEnumValueError(schema.options, context?.property)];
};
