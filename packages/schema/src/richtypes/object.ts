export namespace Object {
  /**
   * Any object value.
   */
  export type Any = Record<string, unknown>;

  /**
   * Object with default value.
   */
  export type Default<Type, _Value extends Type> = Type;
}
