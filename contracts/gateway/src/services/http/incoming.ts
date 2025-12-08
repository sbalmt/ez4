import type { HttpRequest } from './request';

/**
 * Incoming request.
 */
export type HttpIncoming<T extends HttpRequest> = T & {
  /**
   * Request tracking Id.
   */
  readonly requestId: string;

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
