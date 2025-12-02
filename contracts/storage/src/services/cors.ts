/**
 * Bucket CORS configuration.
 */
export interface BucketCors {
  /**
   * List of allowed origins.
   */
  readonly allowOrigins: string[];

  /**
   * List of allowed methods.
   */
  readonly allowMethods?: string[];

  /**
   * List of allowed headers.
   */
  readonly allowHeaders?: string[];

  /**
   * List of exposed headers.
   */
  readonly exposeHeaders?: string[];

  /**
   * Determines how long the preflight result can be cached.
   */
  readonly maxAge?: number;
}
