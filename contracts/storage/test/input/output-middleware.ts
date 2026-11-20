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

export function firstMiddleware<T extends Bucket.ObjectEvent>(next: Bucket.Handler): Bucket.Handler {
  void (0 as unknown as T);
  return (request, context) => next(request, context);
}

export function secondMiddleware<T extends Bucket.ObjectEvent>(next: Bucket.Handler): Bucket.Handler {
  void (0 as unknown as T);
  return (request, context) => next(request, context);
}

export function eventHandler(_event: Bucket.ObjectEvent) {}
