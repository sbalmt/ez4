import type { Topic } from '@ez4/topic';

interface TestEvent extends Topic.Event {
  foo: string;
}

export declare class TestTopic extends Topic.Unordered<TestEvent> {
  subscriptions: [
    Topic.UseSubscription<{
      handler: typeof testHandler;
      middlewares: [typeof firstMiddleware, typeof secondMiddleware];
      listener: typeof topicListener;
    }>
  ];
}

export function testHandler(_request: Topic.Incoming<TestEvent>) {}

export function firstMiddleware<T extends Topic.Event>(next: Topic.Handler<T>, { firstMiddlewareClient }: any): Topic.Handler<T> {
  void firstMiddlewareClient;

  return (request, context) => next(request, context);
}

export function secondMiddleware<T extends Topic.Event>(next: Topic.Handler<T>, { secondMiddlewareClient }: any): Topic.Handler<T> {
  void secondMiddlewareClient;

  return (request, context) => next(request, context);
}

export function topicListener<T extends Topic.Event>(_event: Topic.ServiceEvent<T>, { topicListenerClient }: any): void {
  void topicListenerClient;
}
