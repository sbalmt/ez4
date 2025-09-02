import type { Topic } from '@ez4/topic';

// Missing Topic.Message inheritance.
declare class TestMessage {}

export declare class TestTopic extends Topic.Service<TestMessage> {
  schema: TestMessage;

  subscriptions: [];
}
