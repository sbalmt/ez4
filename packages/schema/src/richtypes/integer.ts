export namespace Integer {
  /**
   * Any integer value.
   */
  export type Any = number;

  /**
   * An integer within a minimum value constraint.
   */
  export type Min<_Value extends number> = number;

  /**
   * An integer within a maximum value constraint.
   */
  export type Max<_Value extends number> = number;

  /**
   * An integer within a minimum and maximum value constraint.
   */
  export type Range<_MinValue extends number, _MaxValue extends number> = number;
}
