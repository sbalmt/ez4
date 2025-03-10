import type { Array } from '@ez4/schema';

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

  /**
   * Array with minimum length.
   */
  min: Array.Min<string, 1>;

  /**
   * Array with maximum length.
   */
  max: Array.Max<string, 10>;

  /**
   * Array with minimum and maximum length.
   */
  size: Array.Size<string, 1, 10>;

  /**
   * Default array value.
   */
  value: Array.Default<string | number, ['foo', 123]>;
}
