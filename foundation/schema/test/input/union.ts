type UnionGroup = string | number;

/**
 * Internal test description.
 *
 * @description Union test object.
 */
export interface UnionTestSchema {
  /**
   * @description Foo property.
   */
  foo: boolean | number | string;

  /**
   * @description Union property group.
   */
  group: number | UnionGroup | boolean;

  /**
   * @description Nullable property.
   */
  nullable: string | boolean | null;

  /**
   * @description Optional property.
   */
  optional: number | string | undefined;

  /**
   * @description Nullable and optional property.
   */
  both?: boolean | number | null;
}
