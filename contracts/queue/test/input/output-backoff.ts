import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {}

/**
 * Queue to test backoff configuration.
 */
export declare class TestQueue extends Queue.Unordered<TestMessage> {
  subscriptions: [];

  backoff: Queue.UseBackoff<{
    minDelay: 15;
    maxDelay: 30;
  }>;
}
