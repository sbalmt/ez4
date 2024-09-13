import type { Service } from '@ez4/common';
import type { Client } from './client.js';

/**
 * Provide all contracts for a self-managed Bucket service.
 */
export namespace Bucket {
  /**
   * Bucket service.
   */
  export declare abstract class Service implements Service.Provider {
    /**
     * Maximum amount of days an object is stored before its auto-deletion.
     */
    autoExpireDays?: number;

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
