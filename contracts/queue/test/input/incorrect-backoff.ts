import type { Queue } from '@ez4/queue';

type TestMessage = {};

// Missing Queue.Backoff inheritance.
declare class TestBackoff {
  maxDelay: 15;
}

export declare class TestQueue extends Queue.Unordered<TestMessage> {
  backoff: TestBackoff;

  subscriptions: [];
}
