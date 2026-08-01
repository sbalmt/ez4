import type { Topic } from '@ez4/topic';

type TestUnionEvent = { foo: string } | { bar: number };

export declare class TestTopic1 extends Topic.Unordered<TestUnionEvent> {
  subscriptions: [
    Topic.UseSubscription<{
      handler: typeof testHandler1;
    }>
  ];
}

export function testHandler1(_request: Topic.Incoming<TestUnionEvent>) {}

type TestIntersectionEvent = { foo: string } & { bar: number };

export declare class TestTopic2 extends Topic.Unordered<TestIntersectionEvent> {
  subscriptions: [
    Topic.UseSubscription<{
      handler: typeof testHandler2;
    }>
  ];
}

export function testHandler2(_request: Topic.Incoming<TestIntersectionEvent>) {}
