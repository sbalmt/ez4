import type { Cron } from '@ez4/scheduler';
import type { schedulerListener } from './common.js';
import type { targetHandler } from './handlers.js';

/**
 * Example of AWS EventBridge Scheduler deployed with EZ4.
 * For rate expressions.
 */
export declare class RateEvent extends Cron.Service {
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
   * Retry up to 10 times in case it fails.
   */
  maxRetries: 10;

  /**
   * Event target.
   */
  target: {
    listener: typeof schedulerListener;
    handler: typeof targetHandler;
  };
}

/**
 * Example of AWS EventBridge Scheduler deployed with EZ4.
 * For cron expressions.
 */
export declare class CronEvent extends Cron.Service {
  /**
   * Group for the scheduler.
   */
  group: 'ez4-group';

  /**
   * Execute every 15 minutes.
   */
  expression: 'cron(*/15 * * * *)';

  /**
   * Execute using the specified timezone.
   */
  timezone: 'America/Sao_Paulo';

  /**
   * Retry up to 10 times in case it fails.
   */
  maxRetries: 10;

  /**
   * Event target.
   */
  target: {
    listener: typeof schedulerListener;
    handler: typeof targetHandler;
  };
}
