/**
 * HTTP CORS configuration.
 */
export interface HttpCors {
  /**
   * List of allowed origins.
   */
  readonly allowOrigins: string[];

  /**
   * List of allowed methods.
   */
  readonly allowMethods?: string[];

  /**
   * Determines whether or not requests can be made with credentials.
   */
  readonly allowCredentials?: boolean;

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
