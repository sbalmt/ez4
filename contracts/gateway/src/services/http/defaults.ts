import type { WebDefaults } from '../defaults';
import type { HttpListener } from './listener';
import type { HttpRequest } from './request';
import type { HttpErrors } from './errors';

/**
 * Default HTTP service parameters.
 */
export interface HttpDefaults<T extends HttpRequest> extends WebDefaults {
  /**
   * Default listener.
   */
  readonly listener?: HttpListener<T>;

  /**
   * Status codes for all known exceptions.
   */
  readonly httpErrors?: HttpErrors;
}
