type InnerType = {
  /**
   * Inner required property.
   */
  foo?: number;

  /**
   * Inner required property.
   */
  bar?: string;
};

/**
 * Required test object.
 */
export interface RequiredTestSchema {
  /**
   * Single property with required object.
   */
  single: Required<InnerType>;

  /**
   * Union property with required object.
   */
  union: Required<InnerType | { baz: boolean }>;
}
