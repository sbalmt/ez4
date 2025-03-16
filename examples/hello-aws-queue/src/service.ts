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
   * Maximum amount of time for the handler to acknowledge the message.
   */
  timeout: 30;

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
