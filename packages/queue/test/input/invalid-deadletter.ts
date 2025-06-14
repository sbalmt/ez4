import type { Queue } from '@ez4/queue';

type TestMessage = {};

// Concrete class is not allowed.
class TestDeadLetter implements Queue.DeadLetter {
  maxRetries!: 10;
}

export declare class TestQueue extends Queue.Service<TestMessage> {
  deadLetter: TestDeadLetter;

  subscriptions: [];
}
