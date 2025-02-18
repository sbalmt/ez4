import type { String } from '@ez4/schema';

/**
 * String type enriched with constraints.
 */
export interface StringTestSchema {
  /**
   * String following any format.
   */
  any: String.Any;

  /**
   * String with minimum length.
   */
  min: String.Min<1>;

  /**
   * String with maximum length.
   */
  max: String.Max<80>;

  /**
   * String with minimum and maximum length.
   */
  size: String.Size<1, 80>;

  /**
   * Default string value.
   */
  value: String.Default<'foo'>;

  /**
   * Literal string value.
   */
  literal: 'foo';
}
