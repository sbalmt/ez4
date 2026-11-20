import type { Cron } from '@ez4/scheduler';

export declare class TestScheduler extends Cron.Service {
  expression: 'rate(1 minute)';

  target: Cron.UseTarget<{
    handler: typeof targetHandler;
    middlewares: [typeof firstMiddleware, typeof secondMiddleware];
  }>;
}

export function firstMiddleware<T extends Cron.Event | null>(next: Cron.Handler<T>): Cron.Handler<T> {
  return (request, context) => next(request, context);
}

export function secondMiddleware<T extends Cron.Event | null>(next: Cron.Handler<T>): Cron.Handler<T> {
  return (request, context) => next(request, context);
}

export function targetHandler() {}
