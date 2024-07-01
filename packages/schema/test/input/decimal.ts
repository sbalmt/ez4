import { Decimal } from '@ez4/schema';

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
}
