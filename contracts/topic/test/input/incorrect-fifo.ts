import type { Topic } from '@ez4/topic';

type TestMessage = {
  id: string;
  user: string;
};

// Missing Topic.FifoMode inheritance.
declare class TestFifoMode {
  groupId: 'user';
  uniqueId: 'id';
}

export declare class TestTopic1 extends Topic.Service<TestMessage> {
  schema: TestMessage;

  fifoMode: TestFifoMode;

  subscriptions: [];
}

export declare class TestTopic2 extends Topic.Service<TestMessage> {
  schema: TestMessage;

  // @ts-ignore Group Id doesn't exist in TestMessage.
  fifoMode: {
    groupId: 'wrong';
  };

  subscriptions: [];
}
