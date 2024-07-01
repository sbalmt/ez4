export namespace Environment {
  /**
   * Bind a variable from the environment.
   */
  export type Variable<T extends string> = T;

  /**
   * Bind a service from the environment.
   */
  export type Service<T> = T;
}
