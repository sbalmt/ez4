/**
 * Array test object.
 */
export interface ArrayTestSchema {
  /**
   * Foo property.
   */
  foo: boolean[];

  /**
   * Bar property.
   */
  bar: (number | string | undefined)[];

  /**
   * Nullable property.
   */
  nullable: boolean[] | null;

  /**
   * Optional property.
   */
  optional: number[] | undefined;

  /**
   * Nullable and optional property.
   */
  both?: string[] | null;
}
