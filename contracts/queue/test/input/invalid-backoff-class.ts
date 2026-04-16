import type { Queue } from '@ez4/queue';

type TestMessage = {};

// Concrete class is not allowed.
class TestBackoff implements Queue.Backoff {
  maxDelay!: 30;
}

export declare class TestQueue extends Queue.Unordered<TestMessage> {
  backoff: TestBackoff;

  subscriptions: [];
}
