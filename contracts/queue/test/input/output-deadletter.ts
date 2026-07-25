import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {}

/**
 * @description Queue to test dead-letter configuration.
 */
export declare class TestQueue extends Queue.Unordered<TestMessage> {
  subscriptions: [];

  deadLetter: Queue.UseDeadLetter<{
    retention: 60;
    maxAttempts: 5;
  }>;
}
