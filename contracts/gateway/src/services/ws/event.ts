import type { HttpIdentity } from '../http/common';
import type { WsData } from './data';

/**
 * WS event.
 */
export interface WsEvent {
  /**
   * Expected identity.
   */
  readonly identity?: HttpIdentity;

  /**
   * Expected event body.
   */
  readonly body?: WsData;
}
