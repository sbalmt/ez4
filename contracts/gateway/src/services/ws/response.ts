import type { WebJsonBody, WebRawBody } from '../web/common';

/**
 * WS response.
 */
export interface WsResponse {
  /**
   * WS body payload.
   */
  readonly body?: WebJsonBody | WebRawBody;
}
