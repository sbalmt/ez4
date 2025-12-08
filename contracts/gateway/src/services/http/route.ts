import type { AuthHandler } from '../auth/handler';
import type { AuthRequest } from '../auth/request';
import type { WebTarget } from '../target';
import type { HttpPath } from './path';
import type { HttpListener } from './listener';
import type { HttpRequest } from './request';
import type { HttpHandler } from './handler';
import type { HttpErrors } from './errors';

/**
 * HTTP route.
 */
export interface HttpRoute<T extends HttpRequest, U extends AuthRequest> extends WebTarget {
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
  readonly listener?: HttpListener<T>;

  /**
   * Entry-point authorizer handler function for the route.
   */
  readonly authorizer?: AuthHandler<U>;

  /**
   * Entry-point handler function for the route.
   */
  readonly handler: HttpHandler<T>;

  /**
   * Map status codes and errors for all known exceptions.
   */
  readonly httpErrors?: HttpErrors;

  /**
   * Determines whether or not the route is disabled.
   */
  readonly disabled?: boolean;

  /**
   * Determines whether or not CORS is enabled for the route.
   */
  readonly cors?: boolean;
}
