import type { AuthHandler } from '../auth/handler';
import type { AuthRequest } from '../auth/request';
import type { WebTarget } from '../target';
import type { WsListener } from './listener';
import type { WsMiddleware } from './middleware';
import type { WsHandler } from './handler';
import type { WsEvent } from './event';

/**
 * WS connect event.
 */
export interface WsConnect<T extends WsEvent, U extends AuthRequest> extends WebTarget {
  /**
   * Optional entry‑point authorizer for the connect handler.
   *
   * - Runs in a separate cloud resource isolated from the connect handler.
   * - Must complete successfully before the connect handler is invoked.
   * - Can enrich the request with authentication/authorization context.
   */
  readonly authorizer?: AuthHandler<U>;

  /**
   * Main entry‑point function for the connect handler.
   *
   * - Runs in its own cloud resource.
   * - Invoked only when a new connection is opened.
   */
  readonly handler: WsHandler<T, void>;

  /**
   * Middleware functions wrapping the connect handler.
   */
  readonly middlewares?: WsMiddleware<T, void>[];

  /**
   * Optional life-cycle listener for the connect handler.
   */
  readonly listener?: WsListener<T>;

  /**
   * Enables VPC access for the connect handler.
   *
   * - Allows the handler to access private resources inside the default VPC.
   * - May increase cold‑start latency.
   */
  readonly vpc?: boolean;
}
