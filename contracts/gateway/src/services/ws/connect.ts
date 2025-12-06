import type { LinkedVariables } from '@ez4/project/library';
import type { HttpAuthorizer, HttpAuthRequest, HttpHandler, HttpListener, HttpRequest } from '../http/common';

/**
 * WS connect event.
 */
export interface WsConnect<T extends HttpRequest, U extends HttpAuthRequest> {
  /**
   * Life-cycle listener function for the event.
   */
  readonly listener?: HttpListener<T | U>;

  /**
   * Authorizer function for the event.
   */
  readonly authorizer?: HttpAuthorizer<U>;

  /**
   * Entry-point handler function for the event.
   */
  readonly handler: HttpHandler<T>;

  /**
   * Default log retention (in days) for the handlers.
   */
  readonly logRetention?: number;

  /**
   * Variables associated to the event.
   */
  readonly variables?: LinkedVariables;

  /**
   * Max execution time (in seconds) for the event.
   */
  readonly timeout?: number;

  /**
   * Amount of memory available (in megabytes) for the handler.
   */
  readonly memory?: number;
}
