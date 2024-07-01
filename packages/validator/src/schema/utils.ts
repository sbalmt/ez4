import type { AnySchema } from '@ez4/schema';

/**
 * Determines whether or not the given value is optional and/or nullable.
 *
 * @param value Value to check.
 * @param schema Schema to check.
 * @returns Returns true if the value is nullable and/or optional.
 */
export const isOptionalNullable = (value: unknown, schema: AnySchema) => {
  return (value === null && schema.nullable) || (value === undefined && schema.optional);
};
