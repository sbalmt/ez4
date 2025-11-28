/**
 * Origin cache.
 */
export interface CdnCache {
  /**
   * Default TTL (in seconds) for cached results.
   */
  readonly ttl: number;

  /**
   * Minimum TTL (in seconds) for cached results.
   */
  readonly minTTL?: number;

  /**
   * Maximum TTL (in seconds) for cached results.
   */
  readonly maxTTL?: number;

  /**
   * Determines whether or not the results are compressed.
   */
  readonly compress?: boolean;

  /**
   * A list containing all header names included in the cache key.
   */
  readonly headers?: string[];

  /**
   * A list containing all cookie names included in the cache key.
   */
  readonly cookies?: string[];

  /**
   * A list containing all query names included in the cache key.
   * If not specified all query strings are included.
   */
  readonly queries?: string[];
}
