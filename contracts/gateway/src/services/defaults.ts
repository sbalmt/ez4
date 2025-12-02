import type { HttpAuthRequest, HttpErrors, HttpListener, HttpRequest } from './common';
import type { HttpPreferences } from './preferences';

/**
 * Default HTTP service parameters.
 */
export interface HttpDefaults<T extends HttpRequest | HttpAuthRequest> {
  /**
   * Default route listener.
   */
  readonly listener?: HttpListener<T>;

  /**
   * Status codes for all known exceptions.
   */
  readonly httpErrors?: HttpErrors;

  /**
   * Default preferences for all handlers and routes.
   */
  readonly preferences?: HttpPreferences;

  /**
   * Default log retention (in days) for the handlers.
   */
  readonly logRetention?: number;

  /**
   * Default execution time (in seconds) for handlers and routes.
   */
  readonly timeout?: number;

  /**
   * Default amount of memory available for handlers.
   */
  readonly memory?: number;
}
