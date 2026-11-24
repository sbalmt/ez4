import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {
  foo: string;
}

export declare class TestQueue extends Queue.Unordered<TestMessage> {
  subscriptions: [
    Queue.UseSubscription<{
      listener: typeof testListener;
      middlewares: [typeof firstMiddleware, typeof secondMiddleware];
      handler: typeof testHandler;
    }>
  ];
}

export function firstMiddleware<T extends Queue.Message>(next: Queue.Handler<T>): Queue.Handler<T> {
  return (request, context) => next(request, context);
}

export function secondMiddleware<T extends Queue.Message>(next: Queue.Handler<T>): Queue.Handler<T> {
  return (request, context) => next(request, context);
}

export function testListener<T extends Queue.Message>(_event: Queue.ServiceEvent<T>) {}

export function testHandler(_request: Queue.Incoming<TestMessage>) {}
