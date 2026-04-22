import type { Queue } from '@ez4/queue';

type TestMessage = {};

export declare class TestQueue extends Queue.Unordered<TestMessage> {
  backoff: Queue.UseBackoff<{
    maxDelay: 45;

    // No extra property is allowed.
    invalid_property: true;
  }>;

  subscriptions: [];
}
