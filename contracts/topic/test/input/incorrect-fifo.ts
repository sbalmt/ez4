import type { Topic } from '@ez4/topic';

type TestEvent = {
  id: string;
  user: string;
};

// Missing Topic.FifoMode inheritance.
declare class TestFifoMode {
  groupId: 'user';
  uniqueId: 'id';
}

export declare class TestTopic1 extends Topic.Ordered<TestEvent> {
  fifoMode: TestFifoMode;

  subscriptions: [];
}

export declare class TestTopic2 extends Topic.Ordered<TestEvent> {
  schema: TestEvent;

  // @ts-expect-error Group Id doesn't exist in TestEvent.
  fifoMode: {
    groupId: 'wrong';
  };

  subscriptions: [];
}
