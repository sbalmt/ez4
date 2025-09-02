import type { String } from '@ez4/schema';

/**
 * String type enriched with regex format.
 */
export interface RegexTestSchema {
  /**
   * String following a regex format.
   */
  test: String.Regex<'^[a-b]+$', 'test'>;
}
