import type { Queue } from '@ez4/queue';
import type { MessageRequest } from '../types';
import type { messageHandlerC } from './handlers';

/**
 * Example of AWS SQS deployed with EZ4.
 */
export declare class Sqs extends Queue.Service<MessageRequest> {
  /**
   * All handlers for the service.
   */
  subscriptions: [
    Queue.UseSubscription<{
      handler: typeof messageHandlerC;
    }>
  ];
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
   * All handlers for the service.
   */
  subscriptions: [
    Queue.UseSubscription<{
      handler: typeof messageHandlerC;
    }>
  ];
}
