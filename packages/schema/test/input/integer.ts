import type { Integer } from '@ez4/schema';

/**
 * Number type enriched with integer format.
 */
export interface IntegerTestSchema {
  /**
   * Number following an integer format.
   */
  any: Integer.Any;

  /**
   * Number following an integer format with minimum value.
   */
  min: Integer.Min<10>;

  /**
   * Number following an integer format with maximum value.
   */
  max: Integer.Max<99>;

  /**
   * Number following an integer format with range value.
   */
  range: Integer.Range<25, 50>;

  /**
   * Default integer value.
   */
  value: Integer.Default<456>;

  /**
   * Literal integer value.
   */
  literal: 123;

  /**
   * Number following a integer format with minimum zero.
   */
  min_zero: Integer.Min<0>;

  /**
   * Number following a integer format with maximum zero.
   */
  max_zero: Integer.Max<0>;

  /**
   * Literal zero value.
   */
  literal_zero: 0;

  /**
   * Default zero value.
   */
  value_zero: Integer.Default<0>;
}
