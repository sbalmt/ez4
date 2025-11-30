import type { Environment } from '@ez4/common';
import type { Queue } from '@ez4/queue';
import type { messageHandlerA, messageHandlerB, messageHandlerC } from './handlers';
import type { MessageRequest } from './types';
import type { queueListener } from './common';

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
  deadLetter: Queue.UseDeadLetter<{
    /**
     * After 5 retries, the message will be sent to the dead-letter.
     */
    maxRetries: 5;
  }>;

  /**
   * All handlers for this queue (When more than one subscription is set, they are chosen randomly).
   */
  subscriptions: [
    Queue.UseSubscription<{
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
    }>,
    Queue.UseSubscription<{
      listener: typeof queueListener;
      handler: typeof messageHandlerB;

      /**
       * Allow up to 5 messages per handler invocation.
       */
      batch: 5;
    }>
  ];

  /**
   * Environment variables for all handlers.
   */
  variables: {
    TEST_VAR1: 'hello-world';
  };

  /**
   * Expose its client to all handlers.
   */
  services: {
    selfVariables: Environment.ServiceVariables;
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
  fifoMode: Queue.UseFifoMode<{
    groupId: 'foo';
  }>;

  /**
   * Optionally enable dead-letter queue.
   */
  deadLetter: Queue.UseDeadLetter<{
    /**
     * After 10 retries, the message will be sent to the dead-letter.
     */
    maxRetries: 10;
  }>;

  /**
   * Maximum amount of time for the handler to acknowledge the message.
   */
  timeout: 150;

  /**
   * All handlers for this queue.
   */
  subscriptions: [
    Queue.UseSubscription<{
      listener: typeof queueListener;
      handler: typeof messageHandlerC;
    }>
  ];

  /**
   * Environment variables for all handlers.
   */
  variables: {
    TEST_VAR1: 'hello-world';
  };

  /**
   * Expose its client to all handlers.
   */
  services: {
    selfVariables: Environment.ServiceVariables;
    selfClient: Environment.Service<FifoSqs>;
  };
}
