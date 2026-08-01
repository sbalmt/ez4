import type { Topic } from '@ez4/topic';

type TestEvent = {
  id: string;
  user: string;
};

export declare class TestTopic extends Topic.Ordered<TestEvent> {
  // @ts-expect-error Missing groupId field.
  fifoMode: {
    uniqueId: 'id';
  };

  subscriptions: [];
}
