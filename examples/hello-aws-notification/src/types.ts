import type { Notification } from '@ez4/notification';
import type { Queue } from '@ez4/queue';

/**
 * Message request example.
 */
export declare class MessageRequest implements Notification.Message, Queue.Message {
  /**
   * Example of validated `string` property coming from the message request.
   */
  foo: string;
}
