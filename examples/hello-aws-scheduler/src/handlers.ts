import type { Cron } from '@ez4/scheduler';
import type { DynamicEvent } from './types';

/**
 * Cron target handler.
 */
export function staticTargetHandler(request: Cron.Incoming<null>): void {
  console.log('Static schedule executed.', request);

  // Do another stuff...
}

/**
 * Cron target handler.
 */
export function dynamicTargetHandler(request: Cron.Incoming<DynamicEvent>): void {
  console.log('Dynamic schedule executed.', request);

  // Do another stuff...
}
