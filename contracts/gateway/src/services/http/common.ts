import type { Service } from '@ez4/common';
import type { WebHeaders, WebIdentity, WebJsonBody, WebPathParameters, WebQueryStrings, WebRawBody } from '../common';
import type { HttpProvider } from './provider';
import type { Http } from './contract';

/**
 * Authorizer request.
 */
export interface HttpAuthRequest {
  /**
   * Expected HTTP headers.
   */
  readonly headers?: WebHeaders;

  /**
   * Expected HTTP path parameters.
   */
  readonly parameters?: WebPathParameters;

  /**
   * Expected HTTP query strings.
   */
  readonly query?: WebQueryStrings;
}

/**
 * Authorizer response.
 */
export interface HttpAuthResponse {
  /**
   * Authorization identity.
   */
  readonly identity?: WebIdentity;
}

/**
 * HTTP request.
 */
export interface HttpRequest {
  /**
   * Expected identity.
   */
  readonly identity?: WebIdentity;

  /**
   * Expected HTTP headers.
   */
  readonly headers?: WebHeaders;

  /**
   * Expected HTTP path parameters.
   */
  readonly parameters?: WebPathParameters;

  /**
   * Expected HTTP query strings.
   */
  readonly query?: WebQueryStrings;

  /**
   * Expected HTTP body payload.
   */
  readonly body?: WebJsonBody | WebRawBody;
}

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

/**
 * Incoming request.
 */
export type HttpIncoming<T extends HttpRequest | HttpAuthRequest> = T & {
  /**
   * Request tracking Id.
   */
  readonly requestId: string;

  /**
   * Determines whether request is base64 encoded or not.
   */
  readonly encoded?: boolean;

  /**
   * Request timestamp.
   */
  readonly timestamp: Date;

  /**
   * Request method.
   */
  readonly method: string;

  /**
   * Request path.
   */
  readonly path: string;

  /**
   * Raw body data (when provided in the request).
   */
  readonly data?: string;
};

/**
 * Request listener.
 */
export type HttpListener<T extends HttpRequest | HttpAuthRequest> = (
  event: Service.AnyEvent<HttpIncoming<T>>,
  context: Service.Context<Http.Service | HttpProvider>
) => Promise<void> | void;

/**
 * Request authorizer.
 */
export type HttpAuthorizer<T extends HttpAuthRequest> = (
  request: HttpIncoming<T> | T,
  context: Service.Context<Http.Service | HttpProvider>
) => Promise<HttpAuthResponse> | HttpAuthResponse;

/**
 * Request handler.
 */
export type HttpHandler<T extends HttpRequest> = (
  request: HttpIncoming<T> | T,
  context: Service.Context<Http.Service | HttpProvider>
) => Promise<HttpResponse> | HttpResponse;

/**
 * HTTP errors.
 */
export type HttpErrors = {
  [code: number]: readonly Error[];
};
