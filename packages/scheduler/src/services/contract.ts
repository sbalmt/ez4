import type { Service } from '@ez4/common';
import type { LinkedVariables } from '@ez4/project/library';
import type { CronEvent, CronHandler, CronIncoming, CronListener } from './common.js';
import type { Client } from './client.js';

/**
 * Provide all contracts for a self-managed Cron service.
 */
export namespace Cron {
  export type Event = CronEvent;

  export type Incoming<T extends Event> = CronIncoming<T>;

  export type Listener<T extends Event> = CronListener<T>;
  export type Handler<T extends Event> = CronHandler<T>;

  export type ServiceEvent<T extends Event = Event> = Service.Event<Incoming<T>>;

  /**
   * Cron target.
   */
  export interface Target<T extends Event = Event> {
    /**
     * Target listener.
     */
    listener?: Listener<T>;

    /**
     * Target handler.
     *
     * @param context Handler context.
     */
    handler: Handler<T>;

    /**
     * Variables associated to the target.
     */
    variables?: LinkedVariables;

    /**
     * Log retention (in days) for the handler.
     */
    retention?: number;

    /**
     * Max execution time (in seconds) for the handler.
     */
    timeout?: number;

    /**
     * Amount of memory available for the handler.
     */
    memory?: number;
  }

  /**
   * Cron service.
   */
  export declare abstract class Service<T extends Event = never> implements Service.Provider {
    /**
     * Scheduler target.
     */
    abstract target: Target<T>;

    /**
     * Scheduler expression or literal 'dynamic' when the created cron service is dynamic.
     */
    abstract expression: 'dynamic' | string;

    /**
     * Event schema.
     */
    schema: T;

    /**
     * Scheduler group name.
     */
    group?: string;

    /**
     * Scheduler expression timezone.
     */
    timezone?: string;

    /**
     * An ISO date to determine when the scheduler should start to work.
     */
    startDate?: string;

    /**
     * An ISO date to determine when the scheduler should stop to work.
     */
    endDate?: string;

    /**
     * Maximum retry attempts for the event before it fails.
     * Default is: 0
     */
    maxRetries?: number;

    /**
     * Maximum age (in seconds) for the event to be eligible for retry attempts.
     */
    maxAge?: number;

    /**
     * Determines whether or not the scheduler is disabled.
     */
    disabled?: boolean;

    /**
     * Variables associated to the target.
     */
    variables?: LinkedVariables;

    /**
     * Service client.
     */
    client: T extends never ? never : Client<T>;
  }
}
