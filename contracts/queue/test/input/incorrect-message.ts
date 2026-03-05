import type { Queue } from '@ez4/queue';

// Missing Queue.Message inheritance.
declare class TestMessage {}

export declare class TestQueue extends Queue.Unordered<TestMessage> {
  subscriptions: [];
}
