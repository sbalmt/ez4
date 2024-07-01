export namespace String {
  /**
   * Any string value.
   */
  export type Any = string;

  /**
   * A string within a minimum length constraint.
   */
  export type Min<_Length extends number> = string;

  /**
   * A string within a maximum length constraint.
   */
  export type Max<_Length extends number> = string;

  /**
   * A string within a minimum and maximum length constraint.
   */
  export type Size<_MinLength extends number, _MaxLength extends number> = string;

  /**
   * A string following the time format.
   */
  export type Time = string;

  /**
   * A string following the date format.
   */
  export type Date = string;

  /**
   * A string following the date and time format.
   */
  export type DateTime = string;

  /**
   * A string following the duration format.
   */
  export type Duration = string;

  /**
   * A string following the email format.
   */
  export type Email = string;

  /**
   * A string following the UUID format.
   */
  export type UUID = string;
}
