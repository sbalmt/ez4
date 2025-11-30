import type { Cron } from './contract';

/**
 * Scheduler client.
 */
export interface Client<T extends Cron.Event> {
  /**
   * Get a previously scheduled event.
   * @param identifier Event identifier.
   * @returns Returns the event details or `undefined` when the event doesn't exist.
   */
  getEvent(identifier: string): Promise<ScheduleEvent<T> | undefined>;

  /**
   * Create a scheduled event.
   *
   * @param identifier Event identifier.
   * @param input Input event.
   */
  createEvent(identifier: string, input: ScheduleEvent<T>): Promise<void>;

  /**
   * Update a previously scheduled event.
   *
   * @param identifier Event identifier.
   * @param input Input event updates.
   */
  updateEvent(identifier: string, input: Partial<ScheduleEvent<T>>): Promise<void>;

  /**
   * Delete a previously scheduled event.
   *
   * @param identifier Event identifier.
   * @returns Returns `true` whether the event was deleted, `false` otherwise.
   */
  deleteEvent(identifier: string): Promise<boolean>;
}

/**
 * Schedule event.
 */

export type ScheduleEvent<T extends Cron.Event> = {
  /**
   * Event date.
   */
  readonly date: Date;

  /**
   * Event payload.
   */
  readonly event: T;

  /**
   * Max retries to perform before the event fails.
   */
  readonly maxRetries?: number;

  /**
   * Max age (in seconds) for the event to perform.
   */
  readonly maxAge?: number;
};
