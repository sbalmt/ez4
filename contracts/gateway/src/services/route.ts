import type { LinkedVariables } from '@ez4/project/library';
import type { HttpPath } from '../types/common';
import type { HttpAuthorizer, HttpAuthRequest, HttpErrors, HttpHandler, HttpListener, HttpRequest } from './common';

/**
 * HTTP route.
 */
export interface HttpRoute<T extends HttpRequest, U extends HttpAuthRequest> {
  /**
   * Route operation name.
   */
  readonly name?: string;

  /**
   * Route path including the HTTP verb.
   */
  readonly path: HttpPath;

  /**
   * Life-cycle listener function for the route.
   */
  readonly listener?: HttpListener<T | U>;

  /**
   * Authorizer function for the route.
   */
  readonly authorizer?: HttpAuthorizer<U>;

  /**
   * Entry-point handler function for the route.
   */
  readonly handler: HttpHandler<T>;

  /**
   * Map status codes and errors for all known exceptions.
   */
  readonly httpErrors?: HttpErrors;

  /**
   * Default log retention (in days) for the handlers.
   */
  readonly logRetention?: number;

  /**
   * Variables associated to the route.
   */
  readonly variables?: LinkedVariables;

  /**
   * Max execution time (in seconds) for the route.
   */
  readonly timeout?: number;

  /**
   * Amount of memory available for the handler.
   */
  readonly memory?: number;

  /**
   * Determines whether or not CORS is enabled for the route.
   */
  readonly cors?: boolean;

  /**
   * Determines whether or not the route is disabled.
   */
  readonly disabled?: boolean;
}
