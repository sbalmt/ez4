import type { Cron } from '@ez4/scheduler';
import type { EventRequest } from '../types.js';

/**
 * Handle all schedule events.
 */
export function scheduleEventHandler(request: Cron.Incoming<EventRequest>): void {
  console.log('Schedule executed.', JSON.stringify(request));

  // Do another stuff...
}
