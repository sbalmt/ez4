import type { CronRequest } from './request';
import type { CronEvent } from './event';

/**
 * Incoming event.
 */
export type CronIncoming<T extends CronEvent | null> = CronRequest & {
  /**
   * Event payload.
   */
  readonly event: T;
};
