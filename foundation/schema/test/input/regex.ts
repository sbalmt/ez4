import type { String } from '@ez4/schema';

/**
 * Internal test description.
 *
 * @description String type enriched with regex format.
 */
export interface RegexTestSchema {
  /**
   * @description String following a regex format.
   */
  test: String.Regex<'^[a-b]+$', 'test'>;
}
