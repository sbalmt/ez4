import type { Service } from '@ez4/common';
import type { CronIncoming } from './incoming';
import type { CronEvent } from './event';
import type { Cron } from './contract';

/**
 * Event listener.
 */
export type CronListener<T extends CronEvent | null> = (
  event: Service.AnyEvent<CronIncoming<T>>,
  context: Service.Context<Cron.Service>
) => Promise<void> | void;
