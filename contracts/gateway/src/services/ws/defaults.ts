import type { WebDefaults } from '../web/defaults';
import type { WsRequest } from './request';
import type { WsListener } from './listener';
import type { WsEvent } from './event';

/**
 * Default WS service parameters.
 */
export interface WsDefaults<T extends WsRequest | WsEvent> extends WebDefaults {
  /**
   * Default listener.
   */
  readonly listener?: WsListener<T>;
}
