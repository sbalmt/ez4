import type { Queue } from '@ez4/queue';

export declare class TestQueue extends Queue.Service {
  schema: TestMessage;

  subscriptions: [];
}

// Concrete class is not allowed.
class TestMessage implements Queue.Message {}
