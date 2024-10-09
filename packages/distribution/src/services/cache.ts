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
}
