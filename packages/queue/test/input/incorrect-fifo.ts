import type { Queue } from '@ez4/queue';

type TestMessage = {
  id: string;
  user: string;
};

// Missing Queue.FifoMode inheritance.
declare class TestFifoMode {
  groupId: 'user';
  uniqueId: 'id';
}

export declare class TestQueue extends Queue.Service<TestMessage> {
  schema: TestMessage;

  fifoMode: TestFifoMode;

  subscriptions: [];
}
