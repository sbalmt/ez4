import type { Cron } from '@ez4/scheduler';
import type { targetHandler } from './handlers.js';

/**
 * Example of AWS EventBridge Scheduler deployed with EZ4.
 */
export declare class Event extends Cron.Service {
  /**
   * Group for the scheduler.
   */
  group: 'ez4-group';

  /**
   * Execute every 5 minutes.
   */
  expression: 'rate(5 minutes)';

  /**
   * Execute using the specified timezone.
   */
  timezone: 'America/Sao_Paulo';

  /**
   * Event target.
   */
  target: {
    handler: typeof targetHandler;
  };

  /**
   * Retry up to 10 times in case it fails.
   */
  maxRetryAttempts: 10;

  /**
   * Define the scheduler start date
   * If defined, it should be higher than the current timestamp.
   */
  // startDate: '2030-01-01T00:00:00-03:00';

  /**
   * Define the scheduler end date.
   * If defined, it should be higher than `startDate`.
   */
  // endDate: '2030-01-01T23:59:59-03:00';

  /**
   * Provide a way to disable the scheduler without deleting it.
   */
  // disabled: true;
}
