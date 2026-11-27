import type { Bucket } from '@ez4/storage';

export declare class TestStorage extends Bucket.Service {
  events: [
    Bucket.UseEvent<{
      path: '*';
      handler: typeof eventHandler;
      middlewares: [typeof firstMiddleware, typeof secondMiddleware];
      listener: typeof eventListener;
    }>
  ];
}

export function eventHandler(_event: Bucket.ObjectEvent) {}

export function firstMiddleware(next: Bucket.Handler, { firstMiddlewareClient }: any): Bucket.Handler {
  void firstMiddlewareClient;

  return (request, context) => next(request, context);
}

export function secondMiddleware(next: Bucket.Handler, { secondMiddlewareClient }: any): Bucket.Handler {
  void secondMiddlewareClient;

  return (request, context) => next(request, context);
}

export function eventListener(_event: Bucket.ServiceEvent, { eventListenerClient }: any): void {
  void eventListenerClient;
}
