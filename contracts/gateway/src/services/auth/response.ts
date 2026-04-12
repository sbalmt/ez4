import type { AuthIdentity } from './identity';

/**
 * Authorization response.
 */
export interface AuthResponse {
  /**
   * Authorization identity.
   *
   * - Returned when the authorizer successfully handle the incoming request.
   * - When omitted, the request is treated as unauthorized.
   * - Attached to the handler's `request.identity` field.
   *
   * @example
   * ```ts
   * identity: {
   *   userId: String.UUID;
   *   tenantId: Integer.Any;
   *   roles: RolesEnum[];
   * }
   * ```
   */
  readonly identity?: AuthIdentity;
}
