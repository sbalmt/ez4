import type { HttpAuthRequest, HttpErrors, HttpListener, HttpRequest } from './common';
import type { WebDefaults } from '../defaults';

/**
 * Default HTTP service parameters.
 */
export interface HttpDefaults<T extends HttpRequest | HttpAuthRequest> extends WebDefaults {
  /**
   * Default listener.
   */
  readonly listener?: HttpListener<T>;

  /**
   * Status codes for all known exceptions.
   */
  readonly httpErrors?: HttpErrors;
}
