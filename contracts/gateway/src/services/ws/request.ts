import type { WebJsonBody, WebRawBody } from '../web/common';
import type { AuthIdentity } from '../auth/identity';

/**
 * WS request.
 */
export interface WsRequest {
  /**
   * Expected identity.
   */
  readonly identity?: AuthIdentity;

  /**
   * Expected event body.
   */
  readonly body?: WebJsonBody | WebRawBody;
}
