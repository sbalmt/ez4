import type { LinkedVariables } from '@ez4/project/library';
import type { CronEvent, CronHandler, CronListener } from './common';

/**
 * Cron target.
 */
export interface CronTarget<T extends CronEvent | null> {
  /**
   * Target listener.
   */
  listener?: CronListener<T>;

  /**
   * Target handler.
   */
  handler: CronHandler<T>;

  /**
   * Variables associated to the target.
   */
  variables?: LinkedVariables;

  /**
   * Log retention (in days) for the handler.
   */
  logRetention?: number;

  /**
   * Max execution time (in seconds) for the handler.
   */
  timeout?: number;

  /**
   * Amount of memory available for the handler.
   */
  memory?: number;
}
