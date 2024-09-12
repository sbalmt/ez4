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
     * Service client.
     */
    client: Client;

    /**
     * Services are not allowed in this provider.
     */
    services: never;
  }
}
