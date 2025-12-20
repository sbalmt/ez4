import type { WebTarget } from '../target';
import type { WsListener } from './listener';
import type { WsHandler } from './handler';
import type { WsEvent } from './event';

/**
 * WS message event.
 */
export interface WsMessage<T extends WsEvent> extends WebTarget {
  /**
   * Life-cycle listener function for the event.
   */
  readonly listener?: WsListener<T>;

  /**
   * Entry-point handler function for the event.
   */
  readonly handler: WsHandler<T>;
}
