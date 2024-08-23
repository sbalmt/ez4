import type { HttpIdentity, HttpJsonBody } from './common.js';

/**
 * HTTP authorizer response.
 */
export interface HttpAuthResponse {
  /**
   * Authorization identity.
   */
  identity?: HttpIdentity;
}

/**
 * HTTP response.
 */
export interface HttpResponse {
  /**
   * Response status code.
   */
  status: number;

  /**
   * Response body.
   */
  body?: HttpJsonBody;
}
