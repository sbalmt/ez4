import type { Service } from '@ez4/common';
import type { CdnFallback } from './fallback.js';
import type { BucketOrigin, RegularOrigin } from './origin.js';

/**
 * Provide all contracts for a self-managed CDN service.
 */
export namespace Cdn {
  export type DefaultRegularOrigin = Omit<RegularOrigin, 'path'>;
  export type DefaultBucketOrigin = Omit<BucketOrigin, 'path'>;

  export type AdditionalRegularOrigin = RegularOrigin;
  export type AdditionalBucketOrigin = BucketOrigin;

  export type Fallback = CdnFallback;

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
    defaultOrigin: DefaultRegularOrigin | DefaultBucketOrigin;

    /**
     * Default index file name (e.g. `index.html`).
     */
    defaultIndex?: string;

    /**
     * Additional origins.
     */
    additionalOrigins?: (AdditionalRegularOrigin | AdditionalBucketOrigin)[];

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
