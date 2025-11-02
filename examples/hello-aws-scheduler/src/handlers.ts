import type { Service } from '@ez4/common';
import type { Cron } from '@ez4/scheduler';
import type { DynamicCron } from './service';
import type { DynamicEvent } from './types';

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
export function dynamicTargetHandler(request: Cron.Incoming<DynamicEvent>, context: Service.Context<DynamicCron>): void {
  console.log('Dynamic schedule executed.', request);

  // Do some stuff...
  context.selfClient.createEvent;
}
