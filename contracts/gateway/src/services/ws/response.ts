import type { WebBody } from '../body';

/**
 * WS response.
 */
export interface WsResponse {
  /**
   * Typed message response body.
   *
   * - Automatically removes fields not matching the contract.
   * - Supports JSON objects and raw string payloads.
   * - Shape is determined by the declared contract.
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
   * // Raw body
   * body: string;
   * ```
   */
  readonly body?: WebBody;
}
