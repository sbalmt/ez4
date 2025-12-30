import type { Topic } from '@ez4/topic';

type TestMessage = {
  id: string;
  user: string;
};

export declare class TestTopic extends Topic.Service<TestMessage> {
  fifoMode: Topic.UseFifoMode<{
    groupId: 'user';
    uniqueId: 'id';

    // No extra property is allowed.
    invalid_property: true;
  }>;

  subscriptions: [];
}
