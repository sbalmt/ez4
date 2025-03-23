import type { EnumSchema } from '@ez4/schema';

export const transformEnum = (value: unknown, schema: EnumSchema) => {
  const { definitions } = schema;

  if (value === null || value === undefined) {
    return definitions?.default;
  }

  for (const { value: enumValue } of schema.options) {
    const valueType = typeof enumValue;

    if ((valueType === 'string' && value === enumValue) || (valueType === 'number' && Number(value) === enumValue)) {
      return enumValue;
    }
  }

  return definitions?.default;
};
