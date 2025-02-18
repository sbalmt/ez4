import type { Boolean } from '@ez4/schema';

/**
 * Boolean test object.
 */
export interface BooleanTestSchema {
  /**
   * Literal boolean value.
   */
  literal: false;

  /**
   * Default boolean value.
   */
  value: Boolean.Default<true>;
}
