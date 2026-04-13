import type { WebTarget } from '../target';
import type { WsListener } from './listener';
import type { WsHandler } from './handler';
import type { WsEvent } from './event';

/**
 * WS message event.
 */
export interface WsMessage<T extends WsEvent> extends WebTarget {
  /**
   * Optional life‑cycle listener for the message handler.
   *
   * - Runs inside the same cloud resource as the message handler.
   * - Receives events such as request begin, request end, and internal transitions.
   * - Useful for logging, tracing, metrics, and instrumentation.
   */
  readonly listener?: WsListener<T>;

  /**
   * Main entry‑point handler for the message handler.
   *
   * - Runs in its own cloud resource.
   * - Invoked only when a new message is received.
   */
  readonly handler: WsHandler<T>;

  /**
   * Enables VPC access for the message handler.
   *
   * - Allows the handler to access private resources inside the default VPC.
   * - May increase cold‑start latency.
   */
  readonly vpc?: boolean;
}
