import type { ArchitectureType, RuntimeType } from '@ez4/project';
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
   * Max execution time (in seconds) for the handler.
   */
  readonly timeout?: number;

  /**
   * Amount of memory available (in megabytes) for the handler.
   */
  readonly memory?: number;

  /**
   * Architecture for the handler.
   */
  readonly architecture?: ArchitectureType;

  /**
   * Runtime for the handler.
   */
  readonly runtime?: RuntimeType;

  /**
   * Determines whether or not VPC is enabled for the target.
   */
  readonly vpc?: boolean;
}
