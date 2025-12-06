import type { NamingStyle } from '@ez4/schema';

/**
 * HTTP preferences configuration.
 */
export interface HttpPreferences {
  /**
   * Determines the naming style for the query strings and body payloads.
   */
  readonly namingStyle?: NamingStyle;
}
