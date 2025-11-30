import type { LinkedVariables } from '@ez4/project/library';
import type { CronEvent, CronHandler, CronListener } from './common';

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
   * Amount of memory available for the handler.
   */
  readonly memory?: number;
}
