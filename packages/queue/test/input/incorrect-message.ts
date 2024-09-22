import type { Queue } from '@ez4/queue';

// Missing Queue.Message inheritance.
declare class TestMessage {}

export declare class TestQueue extends Queue.Service<TestMessage> {
  schema: TestMessage;

  subscriptions: [];
}
