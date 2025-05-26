/**
 * Partial test object.
 */
export interface PartialTestSchema {
  /**
   * Property with partial object.
   */
  property: Partial<{
    /**
     * Inner optional property.
     */
    foo: number;

    /**
     * Inner optional property.
     */
    bar: string;
  }>;
}
