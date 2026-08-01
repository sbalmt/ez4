import type { Topic } from '@ez4/topic';

// Concrete class is not allowed.
class TestEvent implements Topic.Event {}

export declare class TestTopic extends Topic.Unordered<TestEvent> {
  subscriptions: [];
}
