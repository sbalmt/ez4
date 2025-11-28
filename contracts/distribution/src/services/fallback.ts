/**
 * CDN fallback.
 */
export interface CdnFallback {
  /**
   * HTTP error code (4xx or 3xx) that activates the fallback.
   */
  readonly code: number;

  /**
   * Fallback location path.
   */
  readonly location: string;

  /**
   * Optional cache TTL (in seconds) for the fallback.
   */
  readonly ttl?: number;
}
