import type { Service } from '@ez4/common';
import type { Cron } from './contract';

/**
 * Cron event.
 */
export interface CronEvent {}

/**
 * Incoming event.
 */
export type CronIncoming<T extends CronEvent | null> = CronRequest & {
  /**
   * Event payload.
   */
  event: T;
};

/**
 * Incoming request.
 */
export type CronRequest = {
  /**
   * Request tracking Id.
   */
  requestId: string;
};

/**
 * Event listener.
 */
export type CronListener<T extends CronEvent | null> = (
  event: Service.AnyEvent<CronIncoming<T>>,
  context: Service.Context<Cron.Service>
) => Promise<void> | void;

/**
 * Event handler.
 */
export type CronHandler<T extends CronEvent | null> = (
  request: CronIncoming<T>,
  context: Service.Context<Cron.Service<any>>
) => Promise<void> | void;
