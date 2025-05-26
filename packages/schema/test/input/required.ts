/**
 * Required test object.
 */
export interface RequiredTestSchema {
  /**
   * Property with required object.
   */
  property: Required<{
    /**
     * Inner required property.
     */
    foo?: number;

    /**
     * Inner required property.
     */
    bar?: string;
  }>;
}
