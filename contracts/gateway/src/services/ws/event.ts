import type { WebHeaders, WebQueryStrings } from '../web/common';
import type { AuthIdentity } from '../auth/identity';

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
