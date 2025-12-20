import type { AuthHandler } from '../auth/handler';
import type { AuthRequest } from '../auth/request';
import type { WebTarget } from '../target';
import type { WsListener } from './listener';
import type { WsHandler } from './handler';
import type { WsEvent } from './event';

/**
 * WS connect event.
 */
export interface WsConnect<T extends WsEvent, U extends AuthRequest> extends WebTarget {
  /**
   * Life-cycle listener function for the event.
   */
  readonly listener?: WsListener<T>;

  /**
   * Entry-point authorizer handler function for the event.
   */
  readonly authorizer?: AuthHandler<U>;

  /**
   * Entry-point handler function for the event.
   */
  readonly handler: WsHandler<T>;
}
