/**
 * Union test object.
 */
export interface UnionTestSchema {
  /**
   * Foo property.
   */
  foo: boolean | number | string;

  /**
   * Nullable property.
   */
  nullable: string | boolean | null;

  /**
   * Optional property.
   */
  optional: number | string | undefined;

  /**
   * Nullable and optional property.
   */
  both?: boolean | number | null;
}
