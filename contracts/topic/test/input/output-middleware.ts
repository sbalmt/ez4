import type { Topic } from '@ez4/topic';

interface TestEvent extends Topic.Event {
  foo: string;
}

export declare class TestTopic extends Topic.Unordered<TestEvent> {
  subscriptions: [
    Topic.UseSubscription<{
      middlewares: [typeof firstMiddleware, typeof secondMiddleware];
      handler: typeof testHandler;
    }>
  ];
}

export function firstMiddleware(next: Topic.Handler<TestEvent>): Topic.Handler<TestEvent> {
  return (request, context) => next(request, context);
}

export function secondMiddleware(next: Topic.Handler<TestEvent>): Topic.Handler<TestEvent> {
  return (request, context) => next(request, context);
}

export function testHandler(_request: Topic.Incoming<TestEvent>) {}
