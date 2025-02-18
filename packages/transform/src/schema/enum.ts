import type { EnumSchema } from '@ez4/schema';

export const transformEnum = (value: unknown, schema: EnumSchema) => {
  if (value !== null && value !== undefined) {
    for (const { value: enumValue } of schema.options) {
      const valueType = typeof enumValue;

      if (
        (valueType === 'string' && value === enumValue) ||
        (valueType === 'number' && Number(value) === enumValue)
      ) {
        return enumValue;
      }
    }
  }

  return undefined;
};
