import type { HttpRequest } from './request';

/**
 * Incoming request.
 */
export type HttpIncoming<T extends HttpRequest> = T & {
  /**
   *  Unique identifier for the request.
   */
  readonly requestId: string;

  /**
   * Unique identifier across multiple services.
   */
  readonly traceId?: string;

  /**
   * Determines whether request is base64 encoded or not.
   */
  readonly encoded?: boolean;

  /**
   * Request timestamp.
   */
  readonly timestamp: Date;

  /**
   * Request method.
   */
  readonly method: string;

  /**
   * Request path.
   */
  readonly path: string;

  /**
   * Raw body data (when provided in the request).
   */
  readonly data?: string;
};
