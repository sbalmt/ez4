import type { Service } from '@ez4/common';
import type { Bucket } from '@ez4/storage';

/**
 * Provide all contracts for a self-managed CDN service.
 */
export namespace Cdn {
  /**
   * Default origin.
   */
  export interface DefaultOrigin {
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
   * Distribution fallback.
   */
  export interface Fallback {
    /**
     * HTTP error code (4xx or 3xx) that activates the fallback.
     */
    code: number;

    /**
     * Path to the new location.
     */
    path: string;

    /**
     * Optional cache TTL (in seconds) for the fallback.
     */
    ttl?: number;
  }

  /**
   * CDN service.
   */
  export declare abstract class Service implements Service.Provider {
    /**
     * List of CNAME aliases for the distribution.
     */
    aliases: string[];

    /**
     * Default origin for the distribution results.
     */
    defaultOrigin: DefaultOrigin;

    /**
     * Default index file name (e.g. `index.html`).
     */
    defaultIndex?: string;

    /**
     * Distribution fallbacks.
     */
    fallbacks?: Fallback[];

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
