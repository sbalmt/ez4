import type { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';
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
   * Default log retention (in days) for all handlers.
   */
  readonly logRetention?: number;

  /**
   * Log level for all handlers.
   */
  readonly logLevel?: LogLevel;

  /**
   * Default execution time (in seconds) for handlers.
   */
  readonly timeout?: number;

  /**
   * Default amount of memory available (in megabytes) for all handlers.
   */
  readonly memory?: number;

  /**
   * Default architecture for all the API functions.
   */
  readonly architecture?: ArchitectureType;

  /**
   * Default runtime for all the API functions.
   */
  readonly runtime?: RuntimeType;
}
