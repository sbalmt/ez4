import type { Environment } from '@ez4/common';
import type { Queue } from '@ez4/queue';
import type { messageHandlerA, messageHandlerB, messageHandlerC } from './handlers.js';
import type { MessageRequest } from './types.js';
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
   * Optionally enable dead-letter queue.
   */
  deadLetter: {
    /**
     * After 5 retries, the message will be sent to the dead-letter.
     */
    maxRetries: 5;
  };

  /**
   * All handlers for this queue (When more than one subscription is set, they are chosen randomly).
   */
  subscriptions: [
    {
      /**
       * Invocation life-cycle function.
       */
      listener: typeof queueListener;

      /**
       * Message handler.
       */
      handler: typeof messageHandlerA;

      /**
       * Allow up to 2 lambdas concurrently.
       */
      concurrency: 2;
    },
    {
      listener: typeof queueListener;
      handler: typeof messageHandlerB;

      /**
       * Allow up to 5 messages per handler invocation.
       */
      batch: 5;
    }
  ];

  /**
   * Expose its client to all handlers.
   */
  services: {
    selfClient: Environment.Service<Sqs>;
  };
}

/**
 * Example of AWS FIFO SQS deployed with EZ4.
 */
export declare class FifoSqs extends Queue.Service<MessageRequest> {
  /**
   * Define the message group Id field from MessageRequest for FIFO mode.
   */
  fifoMode: {
    groupId: 'foo';
  };

  /**
   * Optionally enable dead-letter queue.
   */
  deadLetter: {
    /**
     * After 10 retries, the message will be sent to the dead-letter.
     */
    maxRetries: 10;
  };

  /**
   * Maximum amount of time for the handler to acknowledge the message.
   */
  timeout: 150;

  /**
   * All handlers for this queue.
   */
  subscriptions: [
    {
      listener: typeof queueListener;
      handler: typeof messageHandlerC;
    }
  ];

  /**
   * Expose its client to all handlers.
   */
  services: {
    selfClient: Environment.Service<FifoSqs>;
  };
}
