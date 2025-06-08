import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {}

/**
 * Queue to test subscription listener.
 */
export declare class TestQueue extends Queue.Service<TestMessage> {
  subscriptions: [];

  deadLetter: {
    maxRetries: 5;
  };
}
