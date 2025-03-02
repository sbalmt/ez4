import type { Cron } from '@ez4/scheduler';
import type { scheduleEventHandler } from './api/events/schedule-event.js';
import type { EventRequest } from './api/types.js';

/**
 * Example of AWS EventBridge Scheduler deployed with EZ4.
 */
export declare class EventScheduler extends Cron.Service<EventRequest> {
  /**
   * Group for the scheduler.
   */
  group: 'ez4-events';

  /**
   * Always for dynamic schedules
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
    handler: typeof scheduleEventHandler;
  };
}
