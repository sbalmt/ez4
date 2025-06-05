import type { String } from '@ez4/schema';

/**
 * String type enriched with base64 format.
 */
export interface Base64TestSchema {
  /**
   * String following a base64 format.
   */
  test: String.Base64;
}
