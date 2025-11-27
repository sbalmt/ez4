import type { Service as CommonService } from '@ez4/common';
import type { LinkedVariables } from '@ez4/project/library';
import type { CronEvent, CronHandler, CronIncoming, CronListener, CronRequest } from './common';
import type { CronTarget } from './target';
import type { Client } from './client';

/**
 * Provide all contracts for a self-managed Cron service.
 */
export namespace Cron {
  export type Event = CronEvent;
  export type Request = CronRequest;

  export type Incoming<T extends Event | null> = CronIncoming<T>;

  export type Listener<T extends Event | null> = CronListener<T>;
  export type Handler<T extends Event | null> = CronHandler<T>;

  export type Target<T extends Event | null> = CronTarget<T>;

  export type ServiceEvent<T extends Event | null = null> = CommonService.AnyEvent<Incoming<T>>;

  /**
   * Cron Target definition.
   */
  export type UseTarget<T extends Target<any>> = T;

  /**
   * Cron service.
   */
  export declare abstract class Service<T extends Event | null = null> implements CommonService.Provider {
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
    client: T extends null ? never : Client<NonNullable<T>>;
  }
}
