/**
 * Scalar test object.
 */
export interface ScalarTestSchema {
  /**
   * Foo property.
   */
  foo: string;

  /**
   * Bar property.
   */
  bar: number;

  /**
   * Baz property.
   */
  baz: boolean;

  /**
   * Nullable property.
   */
  nullable: boolean | null;

  /**
   * Optional property.
   */
  optional: number | undefined;

  /**
   * Nullable and optional property.
   */
  both?: string | null;
}
