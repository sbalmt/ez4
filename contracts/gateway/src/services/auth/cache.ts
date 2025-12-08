/**
 * Authorization cache.
 */
export interface AuthCache {
  /**
   * Default TTL (in seconds) for the authorization cache.
   */
  readonly authorizerTTL: number;
}
