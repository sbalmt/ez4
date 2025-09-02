import type { EnumSchema } from '@ez4/schema';

import { createTransformContext } from '../types/context';

export const transformEnum = (value: unknown, schema: EnumSchema, context = createTransformContext()) => {
  if (value === undefined) {
    return schema.definitions?.default;
  }

  for (const { value: enumValue } of schema.options) {
    const valueType = typeof enumValue;

    if ((valueType === 'string' && value === enumValue) || (valueType === 'number' && Number(value) === enumValue)) {
      return enumValue;
    }
  }

  if (!context.return) {
    return undefined;
  }

  return value;
};
