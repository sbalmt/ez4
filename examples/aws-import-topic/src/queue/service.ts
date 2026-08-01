import type { Queue } from '@ez4/queue';
import type { EventRequest } from 'hello-aws-topic';
import type { messageHandlerB } from './handlers';

/**
 * Example of AWS SQS deployed with EZ4.
 */
export declare class Sqs extends Queue.Unordered<EventRequest> {
  /**
   * All handlers for the service.
   */
  subscriptions: [
    Queue.UseSubscription<{
      handler: typeof messageHandlerB;
    }>
  ];
}

/**
 * Example of AWS FIFO SQS deployed with EZ4.
 */
export declare class FifoSqs extends Queue.Ordered<EventRequest> {
  /**
   * Define the message group Id field from EventRequest for FIFO mode.
   */
  fifoMode: Queue.UseFifoMode<{
    groupId: 'foo';
  }>;

  /**
   * All handlers for the service.
   */
  subscriptions: [
    Queue.UseSubscription<{
      handler: typeof messageHandlerB;
    }>
  ];
}
