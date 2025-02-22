import type { Boolean } from '@ez4/schema';

/**
 * Boolean test object.
 */
export interface BooleanTestSchema {
  /**
   * Literal true value.
   */
  literal_true: true;

  /**
   * Literal false value.
   */
  literal_false: false;

  /**
   * Default true value.
   */
  value_true: Boolean.Default<true>;

  /**
   * Default false value.
   */
  value_false: Boolean.Default<false>;
}
