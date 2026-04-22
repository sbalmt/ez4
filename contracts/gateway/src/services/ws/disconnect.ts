import type { WebTarget } from '../target';
import type { WsListener } from './listener';
import type { WsHandler } from './handler';
import type { WsEvent } from './event';

/**
 * WS disconnect event.
 */
export interface WsDisconnect<T extends WsEvent> extends WebTarget {
  /**
   * Optional life‑cycle listener for the disconnect handler.
   *
   * - Runs inside the same cloud resource as the disconnect handler.
   * - Receives events such as request begin, request end, and internal transitions.
   * - Useful for logging, tracing, metrics, and instrumentation.
   */
  readonly listener?: WsListener<T>;

  /**
   * Main entry‑point handler for the disconnect handler.
   *
   * - Runs in its own cloud resource.
   * - Invoked only when the connection is closed.
   */
  readonly handler: WsHandler<T, void>;

  /**
   * Enables VPC access for the disconnect handler.
   *
   * - Allows the handler to access private resources inside the default VPC.
   * - May increase cold‑start latency.
   */
  readonly vpc?: boolean;
}
