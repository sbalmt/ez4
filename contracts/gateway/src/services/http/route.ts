import type { AuthHandler } from '../auth/handler';
import type { AuthRequest } from '../auth/request';
import type { WebTarget } from '../target';
import type { HttpListener } from './listener';
import type { HttpRequest } from './request';
import type { HttpHandler } from './handler';
import type { HttpErrors } from './errors';
import type { HttpPath } from './path';

/**
 * HTTP route.
 */
export interface HttpRoute<T extends HttpRequest, U extends AuthRequest> extends WebTarget {
  /**
   * Operation name for the route.
   *
   * - When omitted, the route is excluded from the generated API client.
   * - Used for documentation (e.g., OpenAPI generation).
   * - Used to name API client methods.
   */
  readonly name?: string;

  /**
   * HTTP verb and path for the route.
   *
   * - Path parameters must be wrapped in `{}`.
   *
   * @example
   * ```ts
   * path: 'GET /root/{parameter}/path'
   * ```
   */
  readonly path: HttpPath;

  /**
   * Optional life‑cycle listener for the route.
   *
   * - Runs inside the same cloud resource as the route handler.
   * - Receives events such as request start, request end, and internal transitions.
   * - Useful for logging, tracing, metrics, and instrumentation.
   */
  readonly listener?: HttpListener<T>;

  /**
   * Optional entry‑point authorizer for the route.
   *
   * - Runs in a separate cloud resource isolated from the route handler.
   * - Must complete successfully before the route handler is invoked.
   * - Can enrich the request with authentication/authorization context.
   */
  readonly authorizer?: AuthHandler<U>;

  /**
   * Main entry‑point handler for the route.
   *
   * - Runs in its own cloud resource.
   * - Invoked only after the authorizer (if defined) succeeds.
   */
  readonly handler: HttpHandler<T>;

  /**
   * Maps known exceptions to HTTP status codes.
   *
   * - Any exception listed here will be translated to the specified status code.
   * - Unmapped exceptions default to HTTP 500 (Internal Server Error).
   *
   * @example
   * ```ts
   * httpErrors: {
   *   400: [InvalidInputError],
   *   404: [NotFoundError]
   * }
   * ```
   */
  readonly httpErrors?: HttpErrors;

  /**
   * Disables the route.
   *
   * - Disabled routes are ignored during deployment.
   * - No cloud resources are created for them.
   */
  readonly disabled?: boolean;

  /**
   * Enables CORS for the route.
   *
   * - When enabled, CORS responses include the route's HTTP verb and headers.
   */
  readonly cors?: boolean;

  /**
   * Enables VPC access for the route.
   *
   * - Allows the handler to access private resources inside the default VPC.
   * - May increase cold‑start latency.
   */
  readonly vpc?: boolean;
}
