import type { Integer } from '@ez4/schema';

/**
 * Internal test description.
 *
 * @description Number type enriched with integer format.
 */
export interface IntegerTestSchema {
  /**
   * @description Number following an integer format.
   */
  any: Integer.Any;

  /**
   * @description Number following an integer format with minimum value.
   */
  min: Integer.Min<10>;

  /**
   * @description Number following an integer format with maximum value.
   */
  max: Integer.Max<99>;

  /**
   * @description Number following an integer format with range value.
   */
  range: Integer.Range<25, 50>;

  /**
   * @description Default integer value.
   */
  default: Integer.Default<456>;

  /**
   * @description Literal integer value.
   */
  literal: 123;

  /**
   * @description Number following a integer format with minimum zero.
   */
  min_zero: Integer.Min<0>;

  /**
   * @description Number following a integer format with maximum zero.
   */
  max_zero: Integer.Max<0>;

  /**
   * @description Literal zero value.
   */
  literal_zero: 0;

  /**
   * @description Default zero value.
   */
  value_zero: Integer.Default<0>;

  /**
   * @description Compound integer schemas.
   */
  compound: Integer.Range<1, 5> & Integer.Default<25> & 1.5;
}
