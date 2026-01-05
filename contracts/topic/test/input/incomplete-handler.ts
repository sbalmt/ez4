import type { Topic } from '@ez4/topic';

interface TestMessage extends Topic.Message {}

// Missing handler incoming message.
function testHandler() {}

export declare class TestTopic extends Topic.Service<TestMessage> {
  subscriptions: [
    Topic.UseSubscription<{
      handler: typeof testHandler;
    }>
  ];
}
