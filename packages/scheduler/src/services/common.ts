import type { Service } from '@ez4/common';
import type { Cron } from './contract.js';

/**
 * Cron event.
 */
export interface CronEvent {}

/**
 * Incoming event.
 */
export type CronIncoming<T extends CronEvent | null> = {
  /**
   * Request Id.
   */
  requestId: string;

  /**
   * Event payload.
   */
  event: T;
};

/**
 * Event listener.
 */
export type CronListener<T extends CronEvent | null> = (
  event: Service.Event<CronIncoming<T>>,
  context: Service.Context<Cron.Service>
) => Promise<void> | void;

/**
 * Event handler.
 */
export type CronHandler<T extends CronEvent | null> = (
  request: CronIncoming<T>,
  context: Service.Context<Cron.Service<any>>
) => Promise<void> | void;
