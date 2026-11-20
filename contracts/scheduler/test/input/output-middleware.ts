import type { Cron } from '@ez4/scheduler';

export declare class TestScheduler extends Cron.Service {
  expression: 'rate(1 minute)';

  target: Cron.UseTarget<{
    handler: typeof targetHandler;
    middlewares: [typeof firstMiddleware, typeof secondMiddleware];
  }>;
}

export function firstMiddleware(next: Cron.Handler<null>): Cron.Handler<null> {
  return (request, context) => next(request, context);
}

export function secondMiddleware(next: Cron.Handler<null>): Cron.Handler<null> {
  return (request, context) => next(request, context);
}

export function targetHandler() {}
