import type { Environment } from '@ez4/common';
import type { Queue } from '@ez4/queue';
import type { messageHandlerA, messageHandlerC, messageHandlerDedup } from './handlers';
import type { DedupMessageRequest, MessageRequest } from './types';
import type { queueListener } from './listener';

/**
 * Example of a standard queue using local ElasticMQ.
 */
export declare class Sqs extends Queue.Unordered<MessageRequest> {
  timeout: 30;
  retention: 600;
  polling: 20;

  deadLetter: Queue.UseDeadLetter<{
    maxRetries: 5;
  }>;

  fairMode: Queue.UseFairMode<{
    groupId: 'foo';
  }>;

  backoff: Queue.UseBackoff<{
    minDelay: 15;
    maxDelay: 15;
  }>;

  subscriptions: [
    Queue.UseSubscription<{
      listener: typeof queueListener;
      handler: typeof messageHandlerA;
      concurrency: 2;
    }>
  ];

  variables: {
    TEST_VAR1: 'hello-world';
  };

  services: {
    selfVariables: Environment.ServiceVariables;
  };
}

/**
 * Example of a FIFO queue using local ElasticMQ.
 */
export declare class FifoSqs extends Queue.Ordered<MessageRequest> {
  timeout: 150;

  fifoMode: Queue.UseFifoMode<{
    groupId: 'foo';
  }>;

  deadLetter: Queue.UseDeadLetter<{
    maxRetries: 10;
  }>;

  backoff: Queue.UseBackoff<{
    minDelay: 5;
    maxDelay: 90;
  }>;

  subscriptions: [
    Queue.UseSubscription<{
      listener: typeof queueListener;
      handler: typeof messageHandlerC;
    }>
  ];

  variables: {
    TEST_VAR1: 'hello-world';
  };

  services: {
    selfVariables: Environment.ServiceVariables;
  };
}

/**
 * Example of a FIFO queue with explicit deduplication using local ElasticMQ.
 */
export declare class FifoSqsDedup extends Queue.Ordered<DedupMessageRequest> {
  timeout: 150;

  fifoMode: Queue.UseFifoMode<{
    groupId: 'foo';
    uniqueId: 'baz';
  }>;

  subscriptions: [
    Queue.UseSubscription<{
      handler: typeof messageHandlerDedup;
    }>
  ];

  services: {
    selfVariables: Environment.ServiceVariables;
  };
}
