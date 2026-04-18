import type { AuthIdentity } from '../auth/identity';
import type { WebQueryStrings } from '../query';
import type { WebHeaders } from '../headers';

/**
 * WS event.
 */
export interface WsEvent {
  /**
   * Represents the authenticated identity returned by the authorizer.
   *
   * - Populated only when an authorizer is defined.
   * - Useful for access control, multi‑tenant logic, and auditing.
   * - Contains authentication and authorization context.
   */
  readonly identity?: AuthIdentity;

  /**
   * Typed HTTP headers expected by the event.
   *
   * - Only includes headers explicitly in the event contract.
   * - Unknown headers are excluded unless declared.
   * - Automatically validated as strings.
   *
   * @example
   * ```ts
   * headers: {
   *   'x-api-version': string;
   *   'x-request-id': string;
   * }
   * ```
   */
  readonly headers?: WebHeaders;

  /**
   * Typed query string values.
   *
   * - Only includes query strings explicitly declared.
   * - Unknown query strings are excluded unless declared.
   * - Automatically parsed into the declared types.
   *
   * @example
   * ```ts
   * query: {
   *   token?: String.Base64;
   * }
   * ```
   */
  readonly query?: WebQueryStrings;
}
