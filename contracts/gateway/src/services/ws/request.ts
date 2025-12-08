import type { WebIdentity, WebJsonBody, WebRawBody } from '../common';

/**
 * WS request.
 */
export interface WsRequest {
  /**
   * Expected identity.
   */
  readonly identity?: WebIdentity;

  /**
   * Expected event body.
   */
  readonly body?: WebJsonBody | WebRawBody;
}
