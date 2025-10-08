import type { Environment } from '@ez4/common';
import type { Cron } from '@ez4/scheduler';
import type { schedulerListener } from './common';
import type { dynamicTargetHandler, staticTargetHandler } from './handlers';
import type { DynamicEvent } from './types';

/**
 * Example of AWS EventBridge Scheduler for rate expressions.
 */
export declare class RateEvent extends Cron.Service {
  /**
   * Group for the scheduler.
   */
  group: 'ez4-rate-group';

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
    handler: typeof staticTargetHandler;
  };
}

/**
 * Example of AWS EventBridge Scheduler for cron expressions.
 */
export declare class CronEvent extends Cron.Service {
  /**
   * Group for the scheduler.
   */
  group: 'ez4-cron-group';

  /**
   * Execute every 15 minutes.
   */
  expression: 'cron(0/15 * * * ? *)';

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
    handler: typeof staticTargetHandler;
  };
}

/**
 * Example of AWS EventBridge Scheduler for dynamic events.
 */
export declare class DynamicCron extends Cron.Service<DynamicEvent> {
  /**
   * Group for the scheduler.
   */
  group: 'ez4-dynamic-group';

  /**
   * Execute dynamically on-demand.
   */
  expression: 'dynamic';

  /**
   * Retry up to 10 times in case it fails.
   */
  maxRetries: 10;

  /**
   * Event target.
   */
  target: {
    listener: typeof schedulerListener;
    handler: typeof dynamicTargetHandler;
  };

  /**
   * Expose its client to all handlers.
   */
  services: {
    selfClient: Environment.Service<DynamicCron>;
  };
}
