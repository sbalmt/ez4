import type { Topic } from '@ez4/topic';
import type { Environment } from '@ez4/common';
import type { Sqs, FifoSqs } from './queue/service.js';
import type { messageHandlerA, messageHandlerB } from './lambda/handlers.js';
import type { topicListener } from './common.js';
import type { MessageRequest } from './types.js';

/**
 * Example of AWS SNS topic deployed with EZ4.
 */
export declare class Sns extends Topic.Service<MessageRequest> {
  /**
   * All handlers for the service.
   */
  subscriptions: [
    {
      listener: typeof topicListener;
      handler: typeof messageHandlerA;
    },
    {
      handler: typeof messageHandlerB;
    },
    {
      service: Environment.Service<Sqs>;
    }
  ];
}

/**
 * Example of AWS SNS FIFO topic deployed with EZ4.
 */
export declare class FifoSns extends Topic.Service<MessageRequest> {
  /**
   * Define the message group Id field from MessageRequest for FIFO mode.
   */
  fifoMode: {
    groupId: 'foo';
  };

  /**
   * All handlers for the service (FIFO topics only accept SQS).
   */
  subscriptions: [
    {
      service: Environment.Service<Sqs>;
    },
    {
      service: Environment.Service<FifoSqs>;
    }
  ];
}
