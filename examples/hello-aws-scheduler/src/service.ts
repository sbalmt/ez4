import type { Cron } from '@ez4/scheduler';
import type { cronHandler } from './handlers.js';

/**
 * Example of AWS EventBridge Scheduler deployed with EZ4.
 */
export declare class Event extends Cron.Service {
  /**
   * Event handler.
   */
  handler: typeof cronHandler;

  /**
   * Execute every 15 minutes.
   */
  expression: 'rate(15 minutes)';
}
