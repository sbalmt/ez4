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
   * If not specified all query strings are included.
   */
  queries?: string[];
}
