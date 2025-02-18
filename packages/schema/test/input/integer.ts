import { Integer } from '@ez4/schema';

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
}
