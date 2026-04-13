import type { AuthIdentity } from '../auth/identity';
import type { WebBody } from '../body';

/**
 * WS request.
 */
export interface WsRequest {
  /**
   * Represents the authenticated identity returned by the authorizer.
   *
   * - Populated only when an authorizer is defined.
   * - Useful for access control, multi‑tenant logic, and auditing.
   * - Contains authentication and authorization context.
   */
  readonly identity?: AuthIdentity;

  /**
   * Typed request body payload.
   *
   * - Automatically parsed into the declared types.
   * - Supports JSON objects and raw string payloads.
   * - Shape is determined by the declared contract.
   *
   * @example
   * ```ts
   * // JSON body
   * body: {
   *   name: String.Size<1, 20>;
   *   email: String.Email;
   *   age?: Integer.Any;
   * }
   *
   * // Raw body
   * body: string;
   * ```
   */
  readonly body?: WebBody;
}
