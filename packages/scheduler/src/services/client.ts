import type { Cron } from './contract.js';

/**
 * Scheduler client.
 */
export interface Client<T extends Cron.Event> {
  /**
   * Schedule an event.
   *
   * @param identifier Event identifier.
   * @param at Event date.
   * @param event Event payload.
   * @param options Schedule options.
   */
  scheduleEvent(identifier: string, at: Date, event: T, options?: ScheduleOptions): Promise<void>;

  /**
   * Cancel a previously scheduled event.
   *
   * @param identifier Event identifier.
   */
  cancelEvent(identifier: string): Promise<void>;
}

/**
 * Options for sending messages with queue client.
 */
export type ScheduleOptions = {
  /**
   * Event timezone.
   */
  timezone?: string;

  /**
   * Max retries to perform before the event fails.
   */
  maxRetries?: number;

  /**
   * Max age (in seconds) for the event to perform.
   */
  maxAge?: number;
};
