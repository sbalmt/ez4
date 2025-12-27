import type { ServiceArchitecture, ServiceRuntime } from '@ez4/common/library';
import type { WebPreferences } from './preferences';

/**
 * Default service parameters.
 */
export interface WebDefaults {
  /**
   * Default preferences for all handlers.
   */
  readonly preferences?: WebPreferences;

  /**
   * Default log retention (in days) for the handlers.
   */
  readonly logRetention?: number;

  /**
   * Default execution time (in seconds) for handlers.
   */
  readonly timeout?: number;

  /**
   * Default amount of memory available (in megabytes) for handlers.
   */
  readonly memory?: number;

  /**
   * Default architecture for all the API functions.
   */
  readonly architecture?: ServiceArchitecture;

  /**
   * Default runtime for all the API functions.
   */
  readonly runtime?: ServiceRuntime;
}
