import type { Service } from '@ez4/common';
import type { Cron } from './contract.js';

/**
 * Definition of an event schema.
 */
export interface EventSchema {}

/**
 * Incoming cron event.
 */
export type IncomingRequest<T extends EventSchema> = {
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
 * Incoming request handler.
 */
export type RequestHandler<T extends EventSchema> = (
  request: IncomingRequest<T>,
  context: Service.Context<Cron.Service<any>>
) => Promise<void> | void;
