import type { StringSchema } from '@ez4/schema';

export const transformString = (value: unknown, schema: StringSchema) => {
  const { definitions } = schema;

  if (typeof value !== 'string') {
    return definitions?.default;
  }

  if (definitions?.trim) {
    return value.trim();
  }

  return value;
};
