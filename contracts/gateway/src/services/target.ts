import type { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';
import type { LinkedVariables } from '@ez4/project/library';
import type { WebPreferences } from './preferences';

/**
 * Target configuration.
 */
export interface WebTarget {
  /**
   * Target preference options.
   */
  readonly preferences?: WebPreferences;

  /**
   * Default log retention (in days) for the handler.
   */
  readonly logRetention?: number;

  /**
   * Log level for the handler.
   */
  readonly logLevel?: LogLevel;

  /**
   * Variables associated to the event.
   */
  readonly variables?: LinkedVariables;

  /**
   * Max execution time (in seconds) for the event.
   */
  readonly timeout?: number;

  /**
   * Amount of memory available (in megabytes) for the handler.
   */
  readonly memory?: number;

  /**
   * Architecture for the API function.
   */
  readonly architecture?: ArchitectureType;

  /**
   * Runtime for the API function.
   */
  readonly runtime?: RuntimeType;
}
