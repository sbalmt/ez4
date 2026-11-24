import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {
  foo: string;
}

/**
 * @description Queue to test subscription listener.
 */
export declare class TestQueue extends Queue.Unordered<TestMessage> {
  subscriptions: [
    Queue.UseSubscription<{
      listener: typeof testListener;
      handler: typeof testHandler;
    }>
  ];
}

export function testListener<T extends Queue.Message>(_event: Queue.ServiceEvent<T>): void {}

export function testHandler(_request: Queue.Incoming<TestMessage>) {}
