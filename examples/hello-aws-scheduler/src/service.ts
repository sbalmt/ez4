import type { Environment } from '@ez4/common';
import type { Cron } from '@ez4/scheduler';
import type { dynamicTargetHandler, staticTargetHandler } from './handlers';
import type { schedulerMiddleware } from './middleware';
import type { schedulerListener } from './listener';
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
   * Custom tags for the scheduler group.
   */
  tags: Cron.UseTags<{
    TestTag: 'test-tag';
  }>;

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
  target: Cron.UseTarget<{
    handler: typeof staticTargetHandler;
    middlewares: [typeof schedulerMiddleware];
    listener: typeof schedulerListener;
  }>;
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
   * Custom tags for the scheduler group.
   */
  tags: Cron.UseTags<{
    TestTag: 'test-tag';
  }>;

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
  target: Cron.UseTarget<{
    handler: typeof staticTargetHandler;
    middlewares: [typeof schedulerMiddleware];
    listener: typeof schedulerListener;
  }>;
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
  target: Cron.UseTarget<{
    handler: typeof dynamicTargetHandler;
    middlewares: [typeof schedulerMiddleware];
    listener: typeof schedulerListener;
  }>;

  /**
   * Expose its client to all handlers.
   */
  services: {
    selfClient: Environment.Service<DynamicCron>;
  };
}
