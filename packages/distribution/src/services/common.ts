import type { Bucket } from '@ez4/storage';

/**
 * Origin protocols.
 */
export const enum OriginProtocol {
  Https = 'https',
  Http = 'http'
}

/**
 * Origin base.
 */
export interface CdnOrigin {
  /**
   * Path for the origin.
   */
  path: string;

  /**
   * Location path to append in the incoming request.
   */
  location?: string;

  /**
   * Origin cache.
   */
  cache?: CdnCache;
}

/**
 * Bucket origin.
 */
export interface CdnBucketOrigin extends CdnOrigin {
  /**
   * Bucket service used as the origin.
   */
  bucket: Bucket.Service;
}

/**
 * Regular origin.
 */
export interface CdnRegularOrigin extends CdnOrigin {
  /**
   * Domain used as the origin.
   */
  domain: string;

  /**
   * Origin headers.
   */
  headers?: Record<string, string>;

  /**
   * Origin protocol.
   */
  protocol?: OriginProtocol;

  /**
   * Origin port.
   */
  port?: number;
}

/**
 * CDN Certificate.
 */
export interface CdnCertificate {
  /**
   * Reference to the custom certificate.
   */
  domain: string;
}

/**
 * Origin cache.
 */
export interface CdnCache {
  /**
   * Default TTL (in seconds) for cached results.
   */
  ttl: number;

  /**
   * Minimum TTL (in seconds) for cached results.
   */
  minTTL?: number;

  /**
   * Maximum TTL (in seconds) for cached results.
   */
  maxTTL?: number;

  /**
   * Determines whether or not the results are compressed.
   */
  compress?: boolean;

  /**
   * A list containing all header names included in the cache key.
   */
  headers?: string[];

  /**
   * A list containing all cookie names included in the cache key.
   */
  cookies?: string[];

  /**
   * A list containing all query names included in the cache key.
   */
  queries?: string[];
}

/**
 * Distribution fallback.
 */
export interface CdnFallback {
  /**
   * HTTP error code (4xx or 3xx) that activates the fallback.
   */
  code: number;

  /**
   * Fallback location path.
   */
  location: string;

  /**
   * Optional cache TTL (in seconds) for the fallback.
   */
  ttl?: number;
}
