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
