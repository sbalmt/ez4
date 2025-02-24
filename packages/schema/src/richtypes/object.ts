export namespace Object {
  /**
   * Any object value.
   */
  export type Any = Record<string, unknown>;

  /**
   * Object with default value.
   */
  export type Default<Type extends Record<string, unknown>, _Value extends Type> = Type;
}
