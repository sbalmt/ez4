import type { WebJsonBody, WebRawBody } from '../common';

/**
 * WS response.
 */
export interface WsResponse {
  /**
   * WS body payload.
   */
  readonly body?: WebJsonBody | WebRawBody;
}
