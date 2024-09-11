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
