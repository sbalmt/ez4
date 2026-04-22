import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {}

/**
 * Queue to test dead-letter configuration.
 */
export declare class TestQueue extends Queue.Unordered<TestMessage> {
  subscriptions: [];

  deadLetter: Queue.UseDeadLetter<{
    retention: 60;
    maxRetries: 5;
  }>;
}
