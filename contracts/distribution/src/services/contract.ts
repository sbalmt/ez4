import type { Service as CommonService } from '@ez4/common';
import type { Exclusive } from '@ez4/utils';
import type { CdnBucketOrigin, CdnRegularOrigin } from './origin';
import type { CdnCertificate } from './certificate';
import type { CdnFallback } from './fallback';
import type { CdnCache } from './cache';

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

  export type Certificate = CdnCertificate;

  /**
   * CDN Origin definition.
   */
  export type UseDefaultOrigin<T extends Exclusive<DefaultRegularOrigin, DefaultBucketOrigin>> = T;

  /**
   * CDN Origin definition.
   */
  export type UseOrigin<T extends Exclusive<RegularOrigin, BucketOrigin>> = T;

  /**
   * CDN Certificate definition.
   */
  export type UseCertificate<T extends CdnCertificate> = T;

  /**
   * CDN Fallback definition.
   */
  export type UseFallback<T extends CdnFallback> = T;

  /**
   * CDN Cache definition.
   */
  export type UseCache<T extends CdnCache> = T;

  /**
   * CDN service.
   */
  export declare abstract class Service implements CommonService.Provider {
    /**
     * List of CNAME aliases for the distribution.
     */
    aliases: string[];

    /**
     * Custom certificate associated to the distribution.
     */
    certificate?: Certificate;

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
