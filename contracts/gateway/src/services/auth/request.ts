import type { WebPathParameters } from '../web/parameters';
import type { WebQueryStrings } from '../web/query';
import type { WebHeaders } from '../web/headers';

/**
 * Authorization request.
 */
export interface AuthRequest {
  /**
   * Expected HTTP headers.
   */
  readonly headers?: WebHeaders;

  /**
   * Expected HTTP path parameters.
   */
  readonly parameters?: WebPathParameters;

  /**
   * Expected HTTP query strings.
   */
  readonly query?: WebQueryStrings;
}
