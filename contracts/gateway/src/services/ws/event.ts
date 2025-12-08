import type { AuthIdentity } from '../auth/identity';
import type { WebQueryStrings } from '../query';
import type { WebHeaders } from '../headers';

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
