import type { Topic } from '@ez4/topic';

// Concrete class is not allowed.
class TestMessage implements Topic.Message {}

export declare class TestTopic extends Topic.Service<TestMessage> {
  schema: TestMessage;

  subscriptions: [];
}
