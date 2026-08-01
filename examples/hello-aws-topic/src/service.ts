import type { Topic } from '@ez4/topic';
import type { Environment } from '@ez4/common';
import type { Sqs, FifoSqs } from './queue/service';
import type { eventHandlerA, eventHandlerB } from './lambda/handlers';
import type { topicListener } from './listener';
import type { EventRequest } from './types';

/**
 * Example of AWS SNS topic deployed with EZ4.
 */
export declare class Sns extends Topic.Unordered<EventRequest> {
  /**
   * All handlers for the service.
   */
  subscriptions: [
    Topic.UseSubscription<{
      listener: typeof topicListener;
      handler: typeof eventHandlerA;
    }>,
    Topic.UseSubscription<{
      handler: typeof eventHandlerB;
    }>,
    Topic.UseSubscription<{
      service: Environment.Service<Sqs>;
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
  };
}

/**
 * Example of AWS SNS FIFO topic deployed with EZ4.
 */
export declare class FifoSns extends Topic.Ordered<EventRequest> {
  /**
   * Define the event group Id field from EventRequest for FIFO mode.
   */
  fifoMode: Topic.UseFifoMode<{
    groupId: 'foo';
  }>;

  /**
   * All handlers for the service (FIFO topics only accept SQS).
   */
  subscriptions: [
    Topic.UseSubscription<{
      service: Environment.Service<Sqs>;
    }>,
    Topic.UseSubscription<{
      service: Environment.Service<FifoSqs>;
    }>
  ];
}
