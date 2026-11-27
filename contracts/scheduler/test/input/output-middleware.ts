import type { Cron } from '@ez4/scheduler';

export declare class TestScheduler extends Cron.Service {
  expression: 'rate(1 minute)';

  target: Cron.UseTarget<{
    handler: typeof targetHandler;
    middlewares: [typeof firstMiddleware, typeof secondMiddleware];
    listener: typeof targetListener;
  }>;
}

export function targetHandler() {}

export function firstMiddleware<T extends Cron.Event | null>(next: Cron.Handler<T>, { firstMiddlewareClient }: any): Cron.Handler<T> {
  void firstMiddlewareClient;

  return (request, context) => next(request, context);
}

export function secondMiddleware<T extends Cron.Event | null>(next: Cron.Handler<T>, { secondMiddlewareClient }: any): Cron.Handler<T> {
  void secondMiddlewareClient;

  return (request, context) => next(request, context);
}

export function targetListener<T extends Cron.Event | null>(_event: Cron.ServiceEvent<T>, { targetListenerClient }: any): void {
  void targetListenerClient;
}
