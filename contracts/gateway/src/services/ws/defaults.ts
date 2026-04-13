import type { WebDefaults } from '../defaults';
import type { WsRequest } from './request';
import type { WsListener } from './listener';
import type { WsEvent } from './event';

/**
 * Default WS service parameters.
 */
export interface WsDefaults<T extends WsRequest | WsEvent> extends WebDefaults {
  /**
   * Default life‑cycle listener for all routes.
   *
   * - Runs inside the same cloud resource as the handler.
   * - Receives events such as request begin, request end, and internal transitions.
   * - Useful for logging, tracing, metrics, and instrumentation.
   */
  readonly listener?: WsListener<T>;
}
