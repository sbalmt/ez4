import type { Queue } from '@ez4/queue';

type TestMessage = {};

// Missing Queue.DeadLetter inheritance.
declare class TestDeadLetter {
  maxRetries: 5;
}

export declare class TestQueue extends Queue.Service<TestMessage> {
  deadLetter: TestDeadLetter;

  subscriptions: [];
}
