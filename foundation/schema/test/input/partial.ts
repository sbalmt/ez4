type InnerType = {
  /**
   * Inner optional property.
   */
  foo: number;

  /**
   * Inner optional property.
   */
  bar: string;
};

/**
 * Partial test object.
 */
export interface PartialTestSchema {
  /**
   * Single property with partial object.
   */
  single: Partial<InnerType>;

  /**
   * Union property with partial object.
   */
  union: Partial<InnerType | { baz: boolean }>;
}
