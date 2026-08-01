import type { Topic } from '@ez4/topic';

interface TestEvent extends Topic.Event {}

// @ts-expect-error Missing required topic subscriptions.
export declare class TestTopic1 extends Topic.Unordered<TestEvent> {}

// @ts-expect-error Missing required topic schema.
export declare class TestTopic2 extends Topic.Unordered {
  subscriptions: [];
}
