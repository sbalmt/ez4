import type { Queue } from '@ez4/queue';
import type { MessageRequest } from './types.js';
import type { messageHandlerA, messageHandlerB } from './handlers.js';
import type { queueListener } from './common.js';

/**
 * Example of AWS SQS deployed with EZ4.
 */
export declare class Sqs extends Queue.Service<MessageRequest> {
  /**
   * Maximum amount of time for the handler to acknowledge the message.
   */
  timeout: 30;

  /**
   * Retention period (in minutes) for all messages in the queue.
   */
  retention: 600;

  /**
   * Enable long polling with max 20 seconds of wait time.
   */
  polling: 20;

  /**
   * Predefined delay for any message to be delivered.
   */
  delay: 10;

  /**
   * Define a FIFO queue.
   */
  order: true;

  /**
   * All handlers for this queue.
   */
  subscriptions: [
    {
      listener: typeof queueListener;
      handler: typeof messageHandlerA;
      concurrency: 2;
    },
    {
      listener: typeof queueListener;
      handler: typeof messageHandlerB;
      concurrency: 4;
    }
  ];
}
