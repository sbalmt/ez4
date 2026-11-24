import type { Service } from '@ez4/common';
import type { Cron } from '@ez4/scheduler';
import type { DynamicCron } from './service';
import type { DynamicEvent } from './types';

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

/**
 * Cron target handler.
 */
export function staticTargetHandler(request: Cron.Incoming<null>): void {
  console.log('Static schedule executed.', request);

  // Do some stuff...
}

/**
 * Cron target handler.
 */
export function dynamicTargetHandler(request: Cron.Incoming<DynamicEvent>, { selfClient }: Service.Context<DynamicCron>): void {
  console.log('Dynamic schedule executed.', request);

  // Do some stuff...
  selfClient.createEvent;
}
