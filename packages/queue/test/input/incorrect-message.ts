import type { Queue } from '@ez4/queue';

export declare class TestQueue extends Queue.Service {
  schema: TestMessage;

  subscriptions: [];
}

// Missing Queue.Message inheritance.
declare class TestMessage {}
