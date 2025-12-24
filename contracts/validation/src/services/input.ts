import type { AnySchema } from '@ez4/schema';

/**
 * Validation input.
 */
export type ValidationInput<T> = {
  /**
   * Validation schema.
   */
  readonly schema: AnySchema;

  /**
   * Value to be validated.
   */
  readonly value: T;
};
