/**
 * Tuple test object.
 */
export interface TupleTestSchema {
  /**
   * Foo property.
   */
  foo: [boolean, number];

  /**
   * Nullable property.
   */
  nullable: [string, boolean] | null;

  /**
   * Optional property.
   */
  optional: [number, string] | undefined;

  /**
   * Nullable and optional property.
   */
  both?: [boolean, number, string] | null;
}
