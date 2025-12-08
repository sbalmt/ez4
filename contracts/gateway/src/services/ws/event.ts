import type { WebHeaders, WebIdentity, WebQueryStrings } from '../common';

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
  readonly identity?: WebIdentity;
}
