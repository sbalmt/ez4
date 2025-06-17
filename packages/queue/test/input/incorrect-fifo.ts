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

export declare class TestQueue1 extends Queue.Service<TestMessage> {
  fifoMode: TestFifoMode;

  subscriptions: [];
}

export declare class TestQueue2 extends Queue.Service<TestMessage> {
  // @ts-ignore Group Id doesn't exist in TestMessage.
  fifoMode: {
    groupId: 'wrong';
  };

  subscriptions: [];
}
