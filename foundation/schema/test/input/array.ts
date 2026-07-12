import type { Array } from '@ez4/schema';

/**
 * Internal test description.
 *
 * @description Array test object.
 */
export interface ArrayTestSchema {
  /**
   * @description Foo property.
   */
  foo: boolean[];

  /**
   * @description Bar property.
   */
  bar: (number | string | undefined)[];

  /**
   * @description Nullable property.
   */
  nullable: boolean[] | null;

  /**
   * @description Optional property.
   */
  optional: number[] | undefined;

  /**
   * @description Nullable and optional property.
   */
  both?: string[] | null;

  /**
   * @description Array with minimum length.
   */
  min: Array.Min<string, 1>;

  /**
   * @description Array with maximum length.
   */
  max: Array.Max<string, 10>;

  /**
   * @description Array with minimum and maximum length.
   */
  size: Array.Size<string, 1, 10>;

  /**
   * @description Default array value.
   */
  default: Array.Default<string | number, ['foo', 123]>;

  /**
   * @description Base64-encoded array.
   */
  encoded: Array.Base64<{ foo: number; bar: string }>;

  /**
   * @description Combined base64-encoded and default array.
   */
  combined: Array.Base64<Array.Default<{ foo: number; bar: boolean }, [{ foo: 123; bar: false }]>>;
}
