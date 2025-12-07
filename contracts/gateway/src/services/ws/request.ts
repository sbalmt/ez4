import type { HttpHeaders, HttpIdentity, HttpQueryStrings } from '../http/common';

/**
 * WS request.
 */
export interface WsRequest {
  /**
   * Expected HTTP headers.
   */
  readonly headers?: HttpHeaders;

  /**
   * Expected HTTP query strings.
   */
  readonly query?: HttpQueryStrings;

  /**
   * Expected identity.
   */
  readonly identity?: HttpIdentity;
}
