import type { Decimal } from '@ez4/schema';

/**
 * Number type enriched with decimal format.
 */
export interface DecimalTestSchema {
  /**
   * Number following a decimal format.
   */
  any: Decimal.Any;

  /**
   * Number following a decimal format with minimum value.
   */
  min: Decimal.Min<1.1>;

  /**
   * Number following a decimal format with maximum value.
   */
  max: Decimal.Max<9.9>;

  /**
   * Number following a decimal format with range value.
   */
  range: Decimal.Range<2.5, 5.5>;

  /**
   * Default decimal value.
   */
  value: Decimal.Default<4.56>;

  /**
   * Literal decimal value.
   */
  literal: 1.23;

  /**
   * Number following a decimal format with minimum zero.
   */
  min_zero: Decimal.Min<0>;

  /**
   * Number following a decimal format with maximum zero.
   */
  max_zero: Decimal.Max<0>;

  /**
   * Literal zero value.
   */
  literal_zero: 0.0;

  /**
   * Default zero value.
   */
  value_zero: Decimal.Default<0>;
}
