type InnerType = {
  /**
   * @description Inner optional property.
   */
  foo: number;

  /**
   * @description Inner optional property.
   */
  bar: string;
};

/**
 * Internal test description.
 *
 * @description Partial test object.
 */
export interface PartialTestSchema {
  /**
   * @description Single property with partial object.
   */
  single: Partial<InnerType>;

  /**
   * @description Union property with partial object.
   */
  union: Partial<InnerType | { baz: boolean }>;
}
