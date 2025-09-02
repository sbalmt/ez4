import type { Topic } from '@ez4/topic';
import type { Queue } from '@ez4/queue';

/**
 * Message request example.
 */
export declare class MessageRequest implements Topic.Message, Queue.Message {
  /**
   * Example of validated `string` property coming from the message request.
   */
  foo: string;
}
