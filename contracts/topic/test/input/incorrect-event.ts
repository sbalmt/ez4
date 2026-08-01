import type { Topic } from '@ez4/topic';

// Missing Topic.Event inheritance.
declare class TestEvent {}

export declare class TestTopic extends Topic.Unordered<TestEvent> {
  subscriptions: [];
}
