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
   * Variables associated to the event.
   */
  readonly variables?: LinkedVariables;

  /**
   * Default log retention (in days) for the handler.
   */
  readonly logRetention?: number;

  /**
   * Log level for the handler.
   */
  readonly logLevel?: LogLevel;

  /**
   * Architecture type for the cloud function.
   */
  readonly architecture?: ArchitectureType;

  /**
   * Runtime for the cloud function.
   */
  readonly runtime?: RuntimeType;

  /**
   * Max execution time (in seconds) for the handler.
   */
  readonly timeout?: number;

  /**
   * Amount of memory available (in megabytes) for the handler.
   */
  readonly memory?: number;

  /**
   * Additional resource files added into the handle bundle.
   */
  readonly files?: string[];

  /**
   * Determine whether the debug mode is active for the handler.
   */
  readonly debug?: boolean;
}
