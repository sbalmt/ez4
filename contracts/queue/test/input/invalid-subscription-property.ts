import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {}

export declare class TestQueue extends Queue.Service<TestMessage> {
  subscriptions: [
    Queue.UseSubscription<{
      handler: typeof testHandler;

      // No extra property is allowed
      invalid_property: true;
    }>
  ];
}

export function testHandler(_request: Queue.Incoming<TestMessage>) {}
