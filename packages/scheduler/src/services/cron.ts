import type { LinkedVariables } from '@ez4/project/library';
import type { Service } from '@ez4/common';

/**
 * Provide all contracts for a self-managed Cron service.
 */
export namespace Cron {
  /**
   * Execution handler.
   */
  export type Handler = (context: Service.Context<Service>) => Promise<void> | void;

  /**
   * Cron service.
   */
  export declare abstract class Service implements Service.Provider {
    /**
     * Scheduler handler.
     *
     * @param context Handler context.
     */
    abstract handler: Handler;

    /**
     * Scheduler expression.
     */
    abstract expression: string;

    /**
     * Specify the scheduler expression timezone.
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
    maxRetryAttempts?: number;

    /**
     * Maximum age (in seconds) for the event to be eligible for retry attempts.
     */
    maxEventAge?: number;

    /**
     * Determines whether or not the scheduler is disabled.
     */
    disabled?: boolean;

    /**
     * Variables associated to the handler.
     */
    variables?: LinkedVariables;

    /**
     * Max execution time (in seconds) for the handler.
     */
    timeout?: number;

    /**
     * Amount of memory available for the handler.
     */
    memory?: number;

    /**
     * Service client.
     */
    client: never;
  }
}
