/**
 * HTTP cache configuration.
 */
export interface HttpCache {
  /**
   * Default TTL (in seconds) for cached authorizations.
   */
  readonly authorizerTTL: number;
}
