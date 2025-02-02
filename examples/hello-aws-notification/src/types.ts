import type { Notification } from '@ez4/notification';

/**
 * Message request example.
 */
export declare class MessageRequest implements Notification.Message {
  /**
   * Example of validated `string` property coming from the message request.
   */
  foo: string;
}
