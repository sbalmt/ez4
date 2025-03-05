import type { Service } from '@ez4/common';
import type { Cron } from './contract.js';

/**
 * Cron event.
 */
export interface CronEvent {}

/**
 * Incoming event.
 */
export type CronIncoming<T extends CronEvent> = {
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
export type CronListener<T extends CronEvent> = (
  event: Service.Event<T>,
  context: Service.Context<Cron.Service>
) => Promise<void> | void;

/**
 * Event handler.
 */
export type CronHandler<T extends CronEvent> = (
  request: CronIncoming<T>,
  context: Service.Context<Cron.Service<any>>
) => Promise<void> | void;
