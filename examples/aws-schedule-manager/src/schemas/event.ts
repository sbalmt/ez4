import type { Database } from '@ez4/database';
import type { String } from '@ez4/schema';

/**
 * Event status.
 */
export const enum EventStatus {
  Pending = 'pending',
  Completed = 'completed'
}

/**
 * Events table schema.
 */
export declare class EventSchema implements Database.Schema {
  /**
   * Event Id.
   */
  id: String.UUID;

  /**
   * Event date.
   */
  date: String.DateTime;

  /**
   * Event status.
   */
  status: EventStatus;

  /**
   * Event creation date.
   */
  created_at: String.DateTime;

  /**
   * Event last update date.
   */
  updated_at: String.DateTime;
}
