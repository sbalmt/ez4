export namespace Validator {
  /**
   * Use a custom validator service.
   */
  export type Use<Type> = Type extends { schema: infer Schema } ? Schema : never;
}
