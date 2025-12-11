import type { AuthIdentity } from '../auth/identity';
import type { WebPathParameters } from '../web/parameters';
import type { WebQueryStrings } from '../web/query';
import type { WebHeaders } from '../web/headers';
import type { WebBody } from '../web/body';

/**
 * HTTP request.
 */
export interface HttpRequest {
  /**
   * Expected identity.
   */
  readonly identity?: AuthIdentity;

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

  /**
   * Expected HTTP body payload.
   */
  readonly body?: WebBody;
}
