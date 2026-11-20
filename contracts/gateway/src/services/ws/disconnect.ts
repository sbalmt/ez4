import type { WebTarget } from '../target';
import type { WsListener } from './listener';
import type { WsMiddleware } from './middleware';
import type { WsHandler } from './handler';
import type { WsEvent } from './event';

/**
 * WS disconnect event.
 */
export interface WsDisconnect<T extends WsEvent> extends WebTarget {
  /**
   * Main entry‑point function for the disconnect handler.
   *
   * - Runs in its own cloud resource.
   * - Invoked only when the connection is closed.
   */
  readonly handler: WsHandler<T, void>;

  /**
   * Middleware functions wrapping the disconnect handler.
   */
  readonly middlewares?: WsMiddleware<T, void>[];

  /**
   * Optional life-cycle listener for the disconnect handler.
   */
  readonly listener?: WsListener<T>;

  /**
   * Enables VPC access for the disconnect handler.
   *
   * - Allows the handler to access private resources inside the default VPC.
   * - May increase cold‑start latency.
   */
  readonly vpc?: boolean;
}
