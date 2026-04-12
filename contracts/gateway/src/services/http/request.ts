import type { AuthIdentity } from '../auth/identity';
import type { WebPathParameters } from '../parameters';
import type { WebQueryStrings } from '../query';
import type { WebHeaders } from '../headers';
import type { WebBody } from '../body';

/**
 * HTTP request.
 */
export interface HttpRequest {
  /**
   * Represents the authenticated identity returned by the route's authorizer.
   *
   * - Populated only when an authorizer is defined.
   * - Useful for access control, multi‑tenant logic, and auditing.
   * - Contains authentication and authorization context.
   */
  readonly identity?: AuthIdentity;

  /**
   * Typed HTTP headers expected by the route.
   *
   * - Only includes headers explicitly declared.
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
   * Typed path parameters extracted from the route's URL pattern.
   *
   * - Must match the `{}` segments in the route path.
   * - Automatically validated as strings.
   *
   * @example
   * ```ts
   * parameters: {
   *   id: string;
   *   group: string;
   * }
   * ```
   */
  readonly parameters?: WebPathParameters;

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
   *   search: string;
   *   limit: number;
   *   tags: string[];
   * }
   * ```
   */
  readonly query?: WebQueryStrings;

  /**
   * Typed request body payload.
   *
   * - Supports JSON and raw string payloads.
   * - Automatically parsed into the declared types.
   * - Shape is determined by the declared contract.
   *
   * @example
   * ```ts
   * // JSON body
   * body: {
   *   name: string;
   *   email: string;
   *   age?: number;
   * }
   *
   * // Raw body
   * body: string;
   * ```
   */
  readonly body?: WebBody;
}
