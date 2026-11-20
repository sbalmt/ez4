import type { WebTarget } from '../target';
import type { WsListener } from './listener';
import type { WsMiddleware } from './middleware';
import type { WsResponse } from './response';
import type { WsRequest } from './request';
import type { WsHandler } from './handler';

/**
 * WS message event.
 */
export interface WsMessage<T extends WsRequest> extends WebTarget {
  /**
   * Main entry‑point function for the message handler.
   *
   * - Runs in its own cloud resource.
   * - Invoked only when a new message is received.
   */
  readonly handler: WsHandler<T, WsResponse | void>;

  /**
   * Middleware functions wrapping the message handler.
   */
  readonly middlewares?: WsMiddleware<T, WsResponse | void>[];

  /**
   * Optional life-cycle listener for the message handler.
   */
  readonly listener?: WsListener<T>;

  /**
   * Enables VPC access for the message handler.
   *
   * - Allows the handler to access private resources inside the default VPC.
   * - May increase cold‑start latency.
   */
  readonly vpc?: boolean;
}
