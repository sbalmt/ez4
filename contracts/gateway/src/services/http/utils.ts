import type { Http } from './contract';

/**
 * HTTP success status codes.
 */
export type HttpSuccessStatuses = 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208;

/**
 * HTTP empty request.
 */
export declare class HttpEmptyRequest implements Http.Request {}

/**
 * HTTP success response without a response body.
 */
export declare class HttpSuccessEmptyResponse<S extends HttpSuccessStatuses> implements Http.Response {
  /**
   * HTTP status code.
   */
  readonly status: S;
}

/**
 * HTTP success response.
 */
export declare class HttpSuccessResponse<S extends HttpSuccessStatuses, T extends Http.JsonBody | Http.RawBody> implements Http.Response {
  /**
   * HTTP status code.
   */
  readonly status: S;

  /**
   * HTTP response payload.
   */
  readonly body: T;
}
