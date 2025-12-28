import type { Topic } from '@ez4/topic';

type TestUnionMessage = { foo: string } | { bar: number };

export declare class TestTopic1 extends Topic.Service<TestUnionMessage> {
  subscriptions: [
    Topic.UseSubscription<{
      handler: typeof testHandler1;
    }>
  ];
}

export function testHandler1(_request: Topic.Incoming<TestUnionMessage>) {}

type TestIntersectionMessage = { foo: string } & { bar: number };

export declare class TestTopic2 extends Topic.Service<TestIntersectionMessage> {
  subscriptions: [
    Topic.UseSubscription<{
      handler: typeof testHandler2;
    }>
  ];
}

export function testHandler2(_request: Topic.Incoming<TestIntersectionMessage>) {}
