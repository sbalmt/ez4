import type { Boolean } from '@ez4/schema';

/**
 * Internal test description.
 *
 * @description Boolean test object.
 */
export interface BooleanTestSchema {
  /**
   * @description Literal true value.
   */
  literal_true: true;

  /**
   * @description Literal false value.
   */
  literal_false: false;

  /**
   * @description Default true value.
   */
  value_true: Boolean.Default<true>;

  /**
   * @description Default false value.
   */
  value_false: Boolean.Default<false>;

  /**
   * @description Nullable property.
   */
  nullable: boolean | null;

  /**
   * @description Optional property.
   */
  optional: boolean | undefined;

  /**
   * @description Nullable and optional property.
   */
  both?: boolean | null;
}
