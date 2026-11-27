import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {
  foo: string;
}

export declare class TestQueue extends Queue.Unordered<TestMessage> {
  subscriptions: [
    Queue.UseSubscription<{
      handler: typeof testHandler;
      middlewares: [typeof firstMiddleware, typeof secondMiddleware];
      listener: typeof testListener;
    }>
  ];
}

export function testHandler(_request: Queue.Incoming<TestMessage>) {}

export function firstMiddleware<T extends Queue.Message>(next: Queue.Handler<T>, { firstMiddlewareClient }: any): Queue.Handler<T> {
  void firstMiddlewareClient;

  return (request, context) => next(request, context);
}

export function secondMiddleware<T extends Queue.Message>(next: Queue.Handler<T>, { secondMiddlewareClient }: any): Queue.Handler<T> {
  void secondMiddlewareClient;

  return (request, context) => next(request, context);
}

export function testListener<T extends Queue.Message>(_event: Queue.ServiceEvent<T>, { listenerClient }: any) {
  void listenerClient;
}
