import type { Queue } from '@ez4/queue';

type TestMessage = {
  id: string;
  user: string;
};

// Concrete class is not allowed.
class TestFifoMode implements Queue.FifoMode<TestMessage> {
  groupId!: 'user';
  uniqueId!: 'id';
}

export declare class TestQueue extends Queue.Service<TestMessage> {
  schema: TestMessage;

  fifoMode: TestFifoMode;

  subscriptions: [];
}
