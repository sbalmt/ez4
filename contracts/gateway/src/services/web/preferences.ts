import type { NamingStyle } from '@ez4/schema';

/**
 * Preferences configuration.
 */
export interface WebPreferences {
  /**
   * Determines the naming style for the query strings and body payloads.
   */
  readonly namingStyle?: NamingStyle;
}
