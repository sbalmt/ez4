import type { Cron } from '@ez4/scheduler';

/**
 * Wrap scheduler target execution.
 */
export function schedulerMiddleware(next: Cron.Handler<any>): Cron.Handler<any> {
  return async (request, context) => {
    console.log('Scheduler middleware before', request.requestId);

    try {
      return await next(request, context);
    } finally {
      console.log('Scheduler middleware after', request.requestId);
    }
  };
}
