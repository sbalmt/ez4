import type { Service } from '@ez4/common';
import type { HttpProvider } from './provider';
import type { Http } from './contract';

/**
 * Request headers.
 */
export interface HttpHeaders {}

/**
 * Request Identity payload.
 */
export interface HttpIdentity {}

/**
 * Request path parameters.
 */
export interface HttpPathParameters {}

/**
 * Request query strings.
 */
export interface HttpQueryStrings {}

/**
 * Json body payload.
 */
export interface HttpJsonBody {}

/**
 * Raw body payload.
 */
export type HttpRawBody = string;

/**
 * Authorizer request.
 */
export interface HttpAuthRequest {
  /**
   * Expected HTTP headers.
   */
  readonly headers?: HttpHeaders;

  /**
   * Expected HTTP path parameters.
   */
  readonly parameters?: HttpPathParameters;

  /**
   * Expected HTTP query strings.
   */
  readonly query?: HttpQueryStrings;
}

/**
 * Authorizer response.
 */
export interface HttpAuthResponse {
  /**
   * Authorization identity.
   */
  readonly identity?: HttpIdentity;
}

/**
 * HTTP request.
 */
export interface HttpRequest {
  /**
   * Expected identity.
   */
  readonly identity?: HttpIdentity;

  /**
   * Expected HTTP headers.
   */
  readonly headers?: HttpHeaders;

  /**
   * Expected HTTP path parameters.
   */
  readonly parameters?: HttpPathParameters;

  /**
   * Expected HTTP query strings.
   */
  readonly query?: HttpQueryStrings;

  /**
   * Expected HTTP body payload.
   */
  readonly body?: HttpJsonBody | HttpRawBody;
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
  readonly headers?: HttpHeaders;

  /**
   * HTTP body payload.
   */
  readonly body?: HttpJsonBody | HttpRawBody;
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
