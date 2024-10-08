import type { Service } from '@ez4/common';
import type { CdnBucketOrigin, CdnRegularOrigin } from './origin.js';
import type { CdnFallback } from './fallback.js';
import type { CdnCache } from './cache.js';

/**
 * Provide all contracts for a self-managed CDN service.
 */
export namespace Cdn {
  export type DefaultRegularOrigin = Omit<CdnRegularOrigin, 'path'>;
  export type DefaultBucketOrigin = Omit<CdnBucketOrigin, 'path'>;

  export type RegularOrigin = CdnRegularOrigin;
  export type BucketOrigin = CdnBucketOrigin;

  export type Fallback = CdnFallback;
  export type Cache = CdnCache;

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
     * Distribution origins.
     */
    origins?: (RegularOrigin | BucketOrigin)[];

    /**
     * Distribution fallbacks.
     */
    fallbacks?: Fallback[];

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
