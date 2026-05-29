type InnerType = {
  /**
   * @description Inner required property.
   */
  foo?: number;

  /**
   * @description Inner required property.
   */
  bar?: string;
};

/**
 * Internal test description.
 *
 * @description Required test object.
 */
export interface RequiredTestSchema {
  /**
   * @description Single property with required object.
   */
  single: Required<InnerType>;

  /**
   * @description Union property with required object.
   */
  union: Required<InnerType | { baz: boolean }>;
}
