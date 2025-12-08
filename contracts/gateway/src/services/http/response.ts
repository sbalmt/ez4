import type { WebHeaders, WebJsonBody, WebRawBody } from '../web/common';

/**
 * HTTP response.
 */
export interface HttpResponse {
  /**
   * HTTP status code.
   */
  readonly status: number;

  /**
   * HTTP headers.
   */
  readonly headers?: WebHeaders;

  /**
   * HTTP body payload.
   */
  readonly body?: WebJsonBody | WebRawBody;
}
