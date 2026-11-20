import type { Bucket } from '@ez4/storage';

export declare class TestStorage extends Bucket.Service {
  events: [
    Bucket.UseEvent<{
      path: '*';
      handler: typeof eventHandler;
      middlewares: [typeof firstMiddleware, typeof secondMiddleware];
    }>
  ];
}

export function firstMiddleware(next: Bucket.Handler): Bucket.Handler {
  return (request, context) => next(request, context);
}

export function secondMiddleware(next: Bucket.Handler): Bucket.Handler {
  return (request, context) => next(request, context);
}

export function eventHandler(_event: Bucket.ObjectEvent) {}
