import type { Topic } from '@ez4/topic';

type TestMessage = {
  id: string;
  user: string;
};

export declare class TestTopic extends Topic.Service<TestMessage> {
  // @ts-expect-error Missing groupId field.
  fifoMode: {
    uniqueId: 'id';
  };

  subscriptions: [];
}
