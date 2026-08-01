import type { Topic } from '@ez4/topic';

interface TestEvent extends Topic.Event {}

// Missing handler incoming event.
function testHandler() {}

export declare class TestTopic extends Topic.Unordered<TestEvent> {
  subscriptions: [
    Topic.UseSubscription<{
      handler: typeof testHandler;
    }>
  ];
}
