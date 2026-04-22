import type { WebHeaders } from '../headers';
import type { WebBody } from '../body';

/**
 * HTTP response.
 */
export interface HttpResponse {
  /**
   * The HTTP status code returned by the handler.
   *
   * - Determines how the gateway formats the final response.
   * - Must be a valid HTTP status code (e.g., 200, 201, 204).
   *
   * @example
   * ```ts
   * status: 200 | 201;
   * ```
   */
  readonly status: number;

  /**
   * Typed HTTP headers returned by the handler.
   *
   * - Only includes headers explicitly declared in the response contract.
   * - Unknown headers are excluded unless declared.
   *
   * @example
   * ```ts
   * headers: {
   *   'x-custom-value': string;
   * }
   * ```
   */
  readonly headers?: WebHeaders;

  /**
   * Typed HTTP response body.
   *
   * - Automatically removes fields not matching the contract.
   * - Shape is determined by the declared contract.
   * - Supports JSON objects and scalar payloads.
   *
   * @example
   * ```ts
   * // JSON body
   * body: {
   *   id: String.UUID;
   *   email: String.Email;
   *   name: string;
   * }
   *
   * // Scalar body
   * body: string | number | boolean;
   * ```
   */
  readonly body?: WebBody;
}
