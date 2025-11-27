import type { NamingStyle } from '@ez4/schema';

/**
 * Contract for HTTP preferences.
 */
export interface HttpPreferences {
  /**
   * Determines the naming style for the query strings and body payloads.
   */
  namingStyle?: NamingStyle;
}
