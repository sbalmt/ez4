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

export function firstMiddleware<T extends Topic.Event>(next: Topic.Handler<T>): Topic.Handler<T> {
  return (request, context) => next(request, context);
}

export function secondMiddleware<T extends Topic.Event>(next: Topic.Handler<T>): Topic.Handler<T> {
  return (request, context) => next(request, context);
}

export function testHandler(_request: Topic.Incoming<TestEvent>) {}
