import type { AnySchema } from '@ez4/schema';

/**
 * Validation client.
 */
export interface Client {
  /**
   * Validation schema.
   */
  get schema(): AnySchema;

  /**
   * Perform the validation of the given `input` value and return a boolean indicating
   * whether the `input` is valid or not.
   *
   * @param value Input value.
   * @returns Returns `true` when the given value is valid, `false` otherwise.
   */
  tryValidate(value: unknown): Promise<boolean>;

  /**
   * Perform the validation of the given `input` value and throw validation exceptions
   * when there is any.
   *
   * @param value Input value.
   */
  validate(value: unknown): Promise<void>;
}
