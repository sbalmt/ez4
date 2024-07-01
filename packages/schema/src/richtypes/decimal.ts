export namespace Decimal {
  /**
   * Any decimal value.
   */
  export type Any = number;

  /**
   * A decimal within a minimum value constraint.
   */
  export type Min<_Value extends number> = number;

  /**
   * A decimal within a maximum value constraint.
   */
  export type Max<_Value extends number> = number;

  /**
   * A decimal within a minimum and maximum value constraint.
   */
  export type Range<_MinValue extends number, _MaxValue extends number> = number;
}
