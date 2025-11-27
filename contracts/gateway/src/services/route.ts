import type { LinkedVariables } from '@ez4/project/library';
import type { HttpPath } from '../types/common';
import type { HttpAuthorizer, HttpAuthRequest, HttpErrors, HttpHandler, HttpListener, HttpRequest } from './common';

/**
 * HTTP route.
 */
export interface HttpRoute<T extends HttpRequest, U extends HttpAuthRequest> {
  /**
   * Route name.
   */
  name?: string;

  /**
   * Route path.
   */
  path: HttpPath;

  /**
   * Route listener.
   */
  listener?: HttpListener<T | U>;

  /**
   * Route authorizer.
   */
  authorizer?: HttpAuthorizer<U>;

  /**
   * Route handler.
   */
  handler: HttpHandler<T>;

  /**
   * Map status codes and errors for all known exceptions.
   */
  httpErrors?: HttpErrors;

  /**
   * Default log retention (in days) for the handlers.
   */
  logRetention?: number;

  /**
   * Variables associated to the route.
   */
  variables?: LinkedVariables;

  /**
   * Max execution time (in seconds) for the route.
   */
  timeout?: number;

  /**
   * Amount of memory available for the handler.
   */
  memory?: number;

  /**
   * Determines whether or not CORS is enabled for the route.
   */
  cors?: boolean;
}
