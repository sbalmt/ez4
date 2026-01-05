import type { Topic } from '@ez4/topic';

type TestMessage = {
  id: string;
  user: string;
};

// Concrete class is not allowed.
class TestFifoMode implements Topic.FifoMode<TestMessage> {
  groupId!: 'user';
  uniqueId!: 'id';
}

export declare class TestTopic extends Topic.Service<TestMessage> {
  fifoMode: TestFifoMode;

  subscriptions: [];
}
