import type { AuthIdentity } from '../auth/identity';
import type { WebBody } from '../body';

/**
 * WS request.
 */
export interface WsRequest {
  /**
   * Expected identity.
   */
  readonly identity?: AuthIdentity;

  /**
   * Expected event body.
   */
  readonly body?: WebBody;
}
