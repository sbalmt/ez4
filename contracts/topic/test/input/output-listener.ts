import type { Topic } from '@ez4/topic';

interface TestEvent extends Topic.Event {
  foo: string;
}

/**
 * @description Topic to test subscription listener.
 */
export declare class TestTopic extends Topic.Unordered<TestEvent> {
  subscriptions: [
    Topic.UseSubscription<{
      listener: typeof testListener;
      handler: typeof testHandler;
    }>
  ];
}

export function testListener(): void {}

export function testHandler(_request: Topic.Incoming<TestEvent>) {}
