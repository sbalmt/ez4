import type { Cron } from '@ez4/scheduler';

/**
 * Event request example.
 */
export declare class EventRequest implements Cron.Event {
  /**
   * Example of validated `string` property coming from the event request.
   */
  foo: string;
}
