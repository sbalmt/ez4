import type { Topic } from '@ez4/topic';
import type { Queue } from '@ez4/queue';

/**
 * Event request example.
 */
export declare class EventRequest implements Topic.Event, Queue.Message {
  /**
   * Example of validated `string` property coming from the event request.
   */
  foo: string;
}
