import type { Notification } from '@ez4/notification';
import type { Environment } from '@ez4/common';
import type { Sqs } from './queue/service.js';
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
      concurrency: 2;
    },
    {
      handler: typeof messageHandlerB;
      concurrency: 4;
    },
    {
      service: Environment.Service<Sqs>;
    }
  ];
}
