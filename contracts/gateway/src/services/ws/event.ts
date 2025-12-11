import type { AuthIdentity } from '../auth/identity';
import type { WebQueryStrings } from '../web/query';
import type { WebHeaders } from '../web/headers';

/**
 * WS event.
 */
export interface WsEvent {
  /**
   * Expected HTTP headers.
   */
  readonly headers?: WebHeaders;

  /**
   * Expected HTTP query strings.
   */
  readonly query?: WebQueryStrings;

  /**
   * Expected identity.
   */
  readonly identity?: AuthIdentity;
}
