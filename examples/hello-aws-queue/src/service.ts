import type { Queue } from '@ez4/queue';
import type { MessageRequest } from './types.js';
import type { messageHandlerA, messageHandlerB } from './handlers.js';

/**
 * Example of AWS SQS deployed with EZ4.
 */
export declare class Sqs extends Queue.Service<MessageRequest> {
  /**
   * Predefined delay for any message to be delivered.
   */
  delay: 0;

  /**
   * Retention period (in minutes) for all messages in the queue.
   */
  retention: 60;

  /**
   * Maximum amount of time for the handler to acknowledge the message.
   */
  timeout: 30;

  /**
   * All handlers for this queue.
   */
  subscriptions: [
    {
      handler: typeof messageHandlerA;
    },
    {
      handler: typeof messageHandlerB;
    }
  ];
}
