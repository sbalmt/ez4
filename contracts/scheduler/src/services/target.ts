import type { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';
import type { LinkedVariables } from '@ez4/project/library';
import type { CronListener } from './listener';
import type { CronHandler } from './handler';
import type { CronEvent } from './event';

/**
 * Cron target.
 */
export interface CronTarget<T extends CronEvent | null> {
  /**
   * Target listener.
   */
  readonly listener?: CronListener<T>;

  /**
   * Target handler.
   */
  readonly handler: CronHandler<T>;

  /**
   * Variables associated to the target.
   */
  readonly variables?: LinkedVariables;

  /**
   * Log retention (in days) for the handler.
   */
  readonly logRetention?: number;

  /**
   * Log level for the handler.
   */
  readonly logLevel?: LogLevel;

  /**
   * Architecture for the handler.
   */
  readonly architecture?: ArchitectureType;

  /**
   * Runtime for the handler.
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
   * Additional resource files for the handler bundler.
   */
  readonly files?: string[];

  /**
   * Determine whether the debug mode is active for the handler.
   */
  readonly debug?: boolean;

  /**
   * Determines whether or not VPC is enabled for the handler.
   */
  readonly vpc?: boolean;
}
