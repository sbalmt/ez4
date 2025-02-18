export namespace Decimal {
  /**
   * Any decimal value.
   */
  export type Any = number;

  /**
   * A decimal with minimum value constraint.
   */
  export type Min<_Value extends number> = number;

  /**
   * A decimal with maximum value constraint.
   */
  export type Max<_Value extends number> = number;

  /**
   * A decimal with minimum and maximum value constraint.
   */
  export type Range<_MinValue extends number, _MaxValue extends number> = number;

  /**
   * A decimal with default value.
   */
  export type Default<_Value extends number> = number | undefined;
}
