import type { Topic } from '@ez4/topic';

interface TestMessage extends Topic.Message {}

export declare class TestTopic extends Topic.Service<TestMessage> {
  subscriptions: [
    Topic.UseSubscription<{
      handler: typeof testHandler;

      // No extra property is allowed
      invalid_property: true;
    }>
  ];
}

export function testHandler(_request: Topic.Incoming<TestMessage>) {}
