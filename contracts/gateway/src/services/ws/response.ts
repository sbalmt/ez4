import type { WsData } from './data';

/**
 * WS response.
 */
export interface WsResponse {
  /**
   * WS body payload.
   */
  readonly body?: WsData;
}
