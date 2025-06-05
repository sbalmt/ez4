export namespace String {
  /**
   * Any string value.
   */
  export type Any = string;

  /**
   * String with minimum length constraint.
   */
  export type Min<_Length extends number> = string;

  /**
   * String with maximum length constraint.
   */
  export type Max<_Length extends number> = string;

  /**
   * String with minimum and maximum length constraint.
   */
  export type Size<_MinLength extends number, _MaxLength extends number> = string;

  /**
   * String with default value.
   */
  export type Default<_Value extends string> = string;

  /**
   * String matching regex.
   */
  export type Regex<_Pattern extends string, _Name extends string> = string;

  /**
   * String following the UUID format.
   */
  export type UUID = string;

  /**
   * String following the email format.
   */
  export type Email = string;

  /**
   * String following the time format.
   */
  export type Time = string;

  /**
   * String following the date format.
   */
  export type Date = string;

  /**
   * String following the date and time format.
   */
  export type DateTime = string;

  /**
   * String following the duration format.
   */
  export type Duration = string;

  /**
   * String following the base64 format.
   */
  export type Base64 = string;
}
