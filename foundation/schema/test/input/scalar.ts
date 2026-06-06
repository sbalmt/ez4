/**
 * Internal test description.
 *
 * @description Scalar test object.
 */
export interface ScalarTestSchema {
  /**
   * @description Foo property.
   */
  foo: string;

  /**
   * @description Bar property.
   */
  bar: number;

  /**
   * @description Baz property.
   */
  baz: boolean;

  /**
   * @description Nullable property.
   */
  nullable: boolean | null;

  /**
   * @description Optional property.
   */
  optional: number | undefined;

  /**
   * @description Nullable and optional property.
   */
  both?: string | null;
}
