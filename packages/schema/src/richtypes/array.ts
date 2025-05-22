export namespace Array {
  /**
   * Array with minimum length constraint.
   */
  export type Min<Type, _Length extends number> = Type[];

  /**
   * Array with maximum length constraint.
   */
  export type Max<Type, _Length extends number> = Type[];

  /**
   * Array with minimum and maximum length constraint.
   */
  export type Size<Type, _MinLength extends number, _MaxLength extends number> = Type[];

  /**
   * Array with default value.
   */
  export type Default<Type, _Value extends Type[]> = Type[];
}
