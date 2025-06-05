export namespace Integer {
  /**
   * Any integer value.
   */
  export type Any = number;

  /**
   * Integer with minimum value constraint.
   */
  export type Min<_Value extends number> = number;

  /**
   * Integer with maximum value constraint.
   */
  export type Max<_Value extends number> = number;

  /**
   * Integer with minimum and maximum value constraint.
   */
  export type Range<_MinValue extends number, _MaxValue extends number> = number;

  /**
   * Integer with default value.
   */
  export type Default<_Value extends number> = number;
}
