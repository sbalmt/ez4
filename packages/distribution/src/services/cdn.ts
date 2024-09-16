import type { Service } from '@ez4/common';
import type { Bucket } from '@ez4/storage';

/**
 * Provide all contracts for a self-managed CDN service.
 */
export namespace Cdn {
  /**
   * Bucket origin.
   */
  export interface BucketOrigin {
    /**
     * Bucket service for the origin.
     */
    bucket: Bucket.Service;

    /**
     * Specify the origin path.
     */
    path?: string;
  }

  /**
   * CDN service.
   */
  export declare abstract class Service implements Service.Provider {
    /**
     * Default origin for the distribution results.
     */
    defaultOrigin: BucketOrigin;

    /**
     * Default index file name (e.g. `index.html`).
     */
    defaultIndex?: string;

    /**
     * Default TTL (in seconds) for cached results.
     */
    cacheTTL?: number;

    /**
     * Minimum TTL (in seconds) for cached results.
     */
    minCacheTTL?: number;

    /**
     * Maximum TTL (in seconds) for cached results.
     */
    maxCacheTTL?: number;

    /**
     * Determines whether or not the results are compressed.
     */
    compress?: boolean;

    /**
     * Determines whether or not the distribution is disabled.
     */
    disabled?: boolean;

    /**
     * Service client.
     */
    client: never;
  }
}
