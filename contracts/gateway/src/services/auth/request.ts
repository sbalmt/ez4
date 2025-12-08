import type { WebPathParameters } from '../parameters';
import type { WebQueryStrings } from '../query';
import type { WebHeaders } from '../headers';

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
