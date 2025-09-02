export namespace Decimal {
  /**
   * Any decimal value.
   */
  export type Any = number;

  /**
   * Decimal with minimum value constraint.
   */
  export type Min<_Value extends number> = number;

  /**
   * Decimal with maximum value constraint.
   */
  export type Max<_Value extends number> = number;

  /**
   * Decimal with minimum and maximum value constraint.
   */
  export type Range<_MinValue extends number, _MaxValue extends number> = number;

  /**
   * Decimal with default value.
   */
  export type Default<_Value extends number> = number;
}
