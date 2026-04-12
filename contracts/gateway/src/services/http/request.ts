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
   *   id: String.UUID;
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
   *   search?: String.Max<250>;
   *   limit: Integer.Any;
   *   tags: TagsEnum[];
   * }
   * ```
   */
  readonly query?: WebQueryStrings;

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
