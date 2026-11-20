import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {
  foo: string;
}

export declare class TestQueue extends Queue.Unordered<TestMessage> {
  subscriptions: [
    Queue.UseSubscription<{
      middlewares: [typeof firstMiddleware, typeof secondMiddleware];
      handler: typeof testHandler;
    }>
  ];
}

export function firstMiddleware(next: Queue.Handler<TestMessage>): Queue.Handler<TestMessage> {
  return (request, context) => next(request, context);
}

export function secondMiddleware(next: Queue.Handler<TestMessage>): Queue.Handler<TestMessage> {
  return (request, context) => next(request, context);
}

export function testHandler(_request: Queue.Incoming<TestMessage>) {}
