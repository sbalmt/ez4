export namespace Environment {
  /**
   * Bind a variable from the environment.
   */
  export type Variable<Name extends string> = Name;

  /**
   * Bind a value from the environment.
   */
  export type Value<_Name extends string, Default> = Default;

  /**
   * Bind a service from the environment.
   */
  export type Service<T> = T;
}
