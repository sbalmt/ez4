import type { Queue } from '@ez4/queue';
import type { MessageRequest } from '../types.js';
import type { messageHandlerC } from './handlers.js';

/**
 * Example of AWS SQS deployed with EZ4.
 */
export declare class Sqs extends Queue.Service<MessageRequest> {
  /**
   * All handlers for the service.
   */
  subscriptions: [
    {
      handler: typeof messageHandlerC;
    }
  ];
}
