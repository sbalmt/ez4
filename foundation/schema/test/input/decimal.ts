import type { Decimal } from '@ez4/schema';

/**
 * Internal test description.
 *
 * @description Number type enriched with decimal format.
 */
export interface DecimalTestSchema {
  /**
   * @description Number following a decimal format.
   */
  any: Decimal.Any;

  /**
   * @description Number following a decimal format with minimum value.
   */
  min: Decimal.Min<1.1>;

  /**
   * @description Number following a decimal format with maximum value.
   */
  max: Decimal.Max<9.9>;

  /**
   * @description Number following a decimal format with range value.
   */
  range: Decimal.Range<2.5, 5.5>;

  /**
   * @description Default decimal value.
   */
  default: Decimal.Default<4.56>;

  /**
   * @description Literal decimal value.
   */
  literal: 1.23;

  /**
   * @description Number following a decimal format with minimum zero.
   */
  min_zero: Decimal.Min<0>;

  /**
   * @description Number following a decimal format with maximum zero.
   */
  max_zero: Decimal.Max<0>;

  /**
   * @description Default zero value.
   */
  value_zero: Decimal.Default<0>;

  /**
   * @description Literal zero value.
   */
  literal_zero: 0.0;

  /**
   * @description Compound decimal schemas.
   */
  compound: Decimal.Range<0.5, 9.5> & Decimal.Default<25> & 15;
}
