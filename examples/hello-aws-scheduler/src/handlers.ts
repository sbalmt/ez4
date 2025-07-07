import type { Cron } from '@ez4/scheduler';

/**
 * Cron target handler.
 */
export function targetHandler(request: Cron.Incoming<null>): void {
  console.log('Schedule executed.', request);

  // Do another stuff...
}
