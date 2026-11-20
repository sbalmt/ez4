import type { CronHandler } from './handler';
import type { CronEvent } from './event';

/**
 * Cron target middleware.
 */
export type CronMiddleware<T extends CronEvent | null> = (next: CronHandler<T>) => CronHandler<T>;
