import type { String } from '@ez4/schema';

/**
 * Internal test description.
 *
 * @description String type enriched with base64 format.
 */
export interface Base64TestSchema {
  /**
   * @description String following a base64 format.
   */
  test: String.Base64;
}
