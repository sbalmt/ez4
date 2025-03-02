import type { String } from '@ez4/schema';
import type { Cron } from '@ez4/scheduler';

/**
 * Event request example.
 */
export declare class EventRequest implements Cron.Event {
  /**
   * Event id.
   */
  id: String.UUID;

  /**
   * Example of validated `string` property coming from the event request.
   */
  foo: string;
}
