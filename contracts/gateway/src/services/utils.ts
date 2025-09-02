import type { HttpResponse, HttpJsonBody, HttpRawBody } from './common';

export type HttpSuccessStatuses = 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208;

/**
 * Common HTTP success response without a response body.
 */
export declare class HttpEmptySuccessResponse<S extends HttpSuccessStatuses> implements HttpResponse {
  /**
   * HTTP status code.
   */
  status: S;
}

/**
 * Common HTTP success response.
 */
export declare class HttpSuccessResponse<S extends HttpSuccessStatuses, T extends HttpJsonBody | HttpRawBody> implements HttpResponse {
  /**
   * HTTP status code.
   */
  status: S;

  /**
   * HTTP response payload.
   */
  body: T;
}
