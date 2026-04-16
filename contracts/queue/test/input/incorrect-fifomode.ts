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

export declare class TestQueue1 extends Queue.Ordered<TestMessage> {
  fifoMode: TestFifoMode;

  subscriptions: [];
}

export declare class TestQueue2 extends Queue.Unordered<TestMessage> {
  // @ts-expect-error Group Id doesn't exist in TestMessage.
  fifoMode: {
    groupId: 'wrong';
  };

  subscriptions: [];
}
