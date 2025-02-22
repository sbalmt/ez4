import type { BooleanSchema } from '@ez4/schema';

export const transformBoolean = (value: unknown, schema: BooleanSchema) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return schema.definitions?.default;
};
