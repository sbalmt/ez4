import type { Notification } from '@ez4/notification';
import type { MessageRequest } from './types.js';
import type { messageHandlerA, messageHandlerB } from './handlers.js';

/**
 * Example of AWS SNS deployed with EZ4.
 */
export declare class Sns extends Notification.Service<MessageRequest> {
  /**
   * All handlers for the service.
   */
  subscriptions: [
    {
      handler: typeof messageHandlerA;
      concurrency: 2;
    },
    {
      handler: typeof messageHandlerB;
      concurrency: 4;
    }
  ];
}
