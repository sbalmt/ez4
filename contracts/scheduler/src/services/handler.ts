import type { Service } from '@ez4/common';
import type { CronIncoming } from './incoming';
import type { CronEvent } from './event';
import type { Cron } from './contract';

/**
 * Event handler.
 */
export type CronHandler<T extends CronEvent | null> = (
  request: CronIncoming<T>,
  context: Service.Context<Cron.Service<any>>
) => Promise<void> | void;
