import type { Topic } from '@ez4/topic';

interface TestMessage extends Topic.Message {
  foo: string;
}

/**
 * Topic to test subscription listener.
 */
export declare class TestTopic extends Topic.Service<TestMessage> {
  subscriptions: [
    {
      listener: typeof testListener;
      handler: typeof testHandler;
    }
  ];
}

export function testListener(): void {}

export function testHandler(_request: Topic.Incoming<TestMessage>) {}
