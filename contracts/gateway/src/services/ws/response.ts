import type { WebBody } from '../body';

/**
 * WS response.
 */
export interface WsResponse {
  /**
   * WS body payload.
   */
  readonly body?: WebBody;
}
