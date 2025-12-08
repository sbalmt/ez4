import type { AuthIdentity } from './identity';

/**
 * Authorization response.
 */
export interface AuthResponse {
  /**
   * Authorization identity.
   */
  readonly identity?: AuthIdentity;
}
