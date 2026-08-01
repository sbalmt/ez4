import type { Topic } from '@ez4/topic';

type TestEvent = {
  id: string;
  user: string;
};

// Concrete class is not allowed.
class TestFifoMode implements Topic.FifoMode<TestEvent> {
  groupId!: 'user';
  uniqueId!: 'id';
}

export declare class TestTopic extends Topic.Ordered<TestEvent> {
  fifoMode: TestFifoMode;

  subscriptions: [];
}
