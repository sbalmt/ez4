/**
 * Internal test description.
 *
 * @description Tuple test object.
 */
export interface TupleTestSchema {
  /**
   * @description Foo property.
   */
  foo: [boolean, number];

  /**
   * @description Nullable property.
   */
  nullable: [string, boolean] | null;

  /**
   * @description Optional property.
   */
  optional: [number, string] | undefined;

  /**
   * @description Nullable and optional property.
   */
  both?: [boolean, number, string] | null;
}
