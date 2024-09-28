import type { Queue } from '@ez4/queue';

// Concrete class is not allowed.
class TestMessage implements Queue.Message {}

export declare class TestQueue extends Queue.Service<TestMessage> {
  schema: TestMessage;

  subscriptions: [];
}
