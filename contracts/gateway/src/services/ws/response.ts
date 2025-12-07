import type { HttpJsonBody, HttpRawBody } from '../http/common';

/**
 * WS response.
 */
export interface WsResponse {
  /**
   * WS body payload.
   */
  readonly body?: HttpJsonBody | HttpRawBody;
}
