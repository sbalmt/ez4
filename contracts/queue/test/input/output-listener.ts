import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {
  foo: string;
}

/**
 * Queue to test subscription listener.
 */
export declare class TestQueue extends Queue.Service<TestMessage> {
  subscriptions: [
    {
      listener: typeof testListener;
      handler: typeof testHandler;
    }
  ];
}

export function testListener(): void {}

export function testHandler(_request: Queue.Incoming<TestMessage>) {}
