import type { Notification } from '@ez4/notification';
import type { Environment } from '@ez4/common';
import type { Sqs, FifoSqs } from './queue/service.js';
import type { messageHandlerA, messageHandlerB } from './lambda/handlers.js';
import type { notificationListener } from './common.js';
import type { MessageRequest } from './types.js';

/**
 * Example of AWS SNS deployed with EZ4.
 */
export declare class Sns extends Notification.Service<MessageRequest> {
  /**
   * All handlers for the service.
   */
  subscriptions: [
    {
      listener: typeof notificationListener;
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
 * Example of AWS FIFO SNS deployed with EZ4.
 */
export declare class FifoSns extends Notification.Service<MessageRequest> {
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
