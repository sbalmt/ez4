import type { Topic } from '@ez4/topic';

interface TestMessage extends Topic.Message {}

export declare class TestTopic extends Topic.Service<TestMessage> {
  // @ts-expect-error Missing required subscription handler.
  subscriptions: [{}];
}
