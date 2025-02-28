import type { LinkedVariables } from '@ez4/project/library';
import type { Service } from '@ez4/common';
import type { BucketCors, BucketEvent } from './common.js';
import type { Client } from './client.js';

/**
 * Provide all contracts for a self-managed Bucket service.
 */
export namespace Bucket {
  export type Cors = BucketCors;

  /**
   * Bucket event.
   */
  export interface Event {
    /**
     * Event handler.
     *
     * @param event Event object.
     * @param context Handler context.
     */
    handler: (event: BucketEvent, context: Service.Context<Service>) => void | Promise<void>;

    /**
     * Path associated to the event.
     */
    path?: string;

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
  }

  /**
   * Bucket service.
   */
  export declare abstract class Service implements Service.Provider {
    /**
     * Overwrite the global bucket name.
     */
    globalName?: string;

    /**
     * Specify a local path to synchronize with the storage.
     */
    localPath?: string;

    /**
     * Maximum amount of days an object is stored before its auto-deletion.
     */
    autoExpireDays?: number;

    /**
     * Bucket events.
     */
    events?: Event;

    /**
     * CORS configuration.
     */
    cors?: Cors;

    /**
     * Variables associated to all events.
     */
    variables?: LinkedVariables;

    /**
     * Service client.
     */
    client: Client;
  }
}
