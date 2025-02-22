import type { NumberSchema } from '@ez4/schema';

export const transformNumber = (value: unknown, schema: NumberSchema) => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const result = Number(value);

    if (!Number.isNaN(result) && Number.isFinite(result)) {
      return result;
    }
  }

  return schema.definitions?.default;
};
