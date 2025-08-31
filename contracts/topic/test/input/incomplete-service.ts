import type { Topic } from '@ez4/topic';

interface TestMessage extends Topic.Message {}

// @ts-ignore Missing required topic subscriptions.
export declare class TestTopic1 extends Topic.Service<TestMessage> {}

// @ts-ignore Missing required topic schema.
export declare class TestTopic2 extends Topic.Service {
  subscriptions: [];
}
