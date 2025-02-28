import type { Service } from '@ez4/common';
import type { BucketCors } from './common.js';
import type { Client } from './client.js';

/**
 * Provide all contracts for a self-managed Bucket service.
 */
export namespace Bucket {
  export type Cors = BucketCors;

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
     * CORS configuration.
     */
    cors?: Cors;

    /**
     * Service client.
     */
    client: Client;

    /**
     * Services are not allowed in this provider.
     */
    services: never;
  }
}
