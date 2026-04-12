import type { WebPathParameters } from '../parameters';
import type { WebQueryStrings } from '../query';
import type { WebHeaders } from '../headers';

/**
 * Authorization request.
 */
export interface AuthRequest {
  /**
   * Typed HTTP headers available to the authorizer.
   *
   * - Only includes headers explicitly declared in the route contract.
   * - Unknown headers are excluded unless declared.
   * - Automatically validated and normalized.
   *
   * @example
   * ```ts
   * headers: {
   *   'authorization': string;
   *   'x-api-key': string;
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
   *   userId: String.UUID;
   * }
   * ```
   */
  readonly parameters?: WebPathParameters;

  /**
   * Typed query string values available to the authorizer.
   *
   * - Only includes query strings explicitly declared.
   * - Unknown query strings are excluded unless declared.
   * - Automatically parsed into the declared types.
   *
   * @example
   * ```ts
   * query: {
   *   token: string;
   * }
   * ```
   */
  readonly query?: WebQueryStrings;
}
