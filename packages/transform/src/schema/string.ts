import type { StringSchema } from '@ez4/schema';

export const transformString = (value: unknown, schema: StringSchema) => {
  if (typeof value === 'string') {
    return value;
  }

  return schema.definitions?.default;
};
