import type { Service } from '@ez4/common';
import type { CronHandler } from './handler';
import type { CronEvent } from './event';
import type { Cron } from './contract';

/**
 * Cron target middleware.
 */
export type CronMiddleware<T extends CronEvent | null> = (
  next: CronHandler<T>,
  context: Service.Context<Cron.Service<any>>
) => CronHandler<T>;
