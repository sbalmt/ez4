import type { WebBody } from '../web/body';

/**
 * WS response.
 */
export interface WsResponse {
  /**
   * WS body payload.
   */
  readonly body?: WebBody;
}
