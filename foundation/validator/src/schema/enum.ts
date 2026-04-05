import type { EnumSchema } from '@ez4/schema';
import type { ValidationContext } from '../types/context';

import { isNotNullish } from '@ez4/utils';

import { UnexpectedEnumValueError } from '../errors/enum';
import { useCustomValidation } from '../utils/custom';
import { isNullishAllowed } from '../utils/nullish';

const isDefaultAllowed = (value: unknown, schema: EnumSchema) => {
  return value === undefined && isNotNullish(schema.definitions?.default);
};

export const validateEnum = (value: unknown, schema: EnumSchema, context?: ValidationContext) => {
  if (isNullishAllowed(value, schema) || isDefaultAllowed(value, schema)) {
    return [];
  }

  const { definitions } = schema;

  for (const enumOption of schema.options) {
    if (value === enumOption.value) {
      if (definitions?.types && context) {
        return useCustomValidation(value, schema, definitions.types, context);
      }

      return [];
    }
  }

  return [new UnexpectedEnumValueError(schema.options, context?.property)];
};
