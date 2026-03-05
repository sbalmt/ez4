import type { Queue } from '@ez4/queue';

type TestUnionMessage = { foo: string } | { bar: number };

export declare class TestQueue1 extends Queue.Unordered<TestUnionMessage> {
  subscriptions: [
    Queue.UseSubscription<{
      handler: typeof testHandler1;
    }>
  ];
}

export function testHandler1(_request: Queue.Incoming<TestUnionMessage>) {}

type TestIntersectionMessage = { foo: string } & { bar: number };

export declare class TestQueue2 extends Queue.Unordered<TestIntersectionMessage> {
  subscriptions: [
    Queue.UseSubscription<{
      handler: typeof testHandler2;
    }>
  ];
}

export function testHandler2(_request: Queue.Incoming<TestIntersectionMessage>) {}
