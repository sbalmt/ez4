import type { Service } from '@ez4/common';
import type { Http } from './contract.js';

/**
 * HTTP CORS configuration.
 */
export interface HttpCors {
  /**
   * List of allowed origins.
   */
  allowOrigins: string[];

  /**
   * List of allowed methods.
   */
  allowMethods?: string[];

  /**
   * Determines whether or not requests can be made with credentials.
   */
  allowCredentials?: boolean;

  /**
   * List of allowed headers.
   */
  allowHeaders?: string[];

  /**
   * List of exposed headers.
   */
  exposeHeaders?: string[];

  /**
   * Determines how long the preflight result can be cached.
   */
  maxAge?: number;
}

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
 * Request body payload.
 */
export interface HttpJsonBody {}

/**
 * Authorizer request.
 */
export interface HttpAuthRequest {
  /**
   * Expected headers.
   */
  headers?: HttpHeaders;

  /**
   * Expected path parameters.
   */
  parameters?: HttpPathParameters;

  /**
   * Expected query strings.
   */
  query?: HttpQueryStrings;
}

/**
 * Authorizer response.
 */
export interface HttpAuthResponse {
  /**
   * Authorization identity.
   */
  identity?: HttpIdentity;
}

/**
 * HTTP request.
 */
export interface HttpRequest {
  /**
   * Expected headers.
   */
  headers?: HttpHeaders;

  /**
   * Expected identity.
   */
  identity?: HttpIdentity;

  /**
   * Expected path parameters.
   */
  parameters?: HttpPathParameters;

  /**
   * Expected query strings.
   */
  query?: HttpQueryStrings;

  /**
   * Expected JSON body payload.
   */
  body?: HttpJsonBody;
}

/**
 * HTTP response.
 */
export interface HttpResponse {
  /**
   * Response status code.
   */
  status: number;

  /**
   * Response headers.
   */
  headers?: HttpHeaders;

  /**
   * Response body.
   */
  body?: HttpJsonBody;
}

/**
 * Incoming request.
 */
export type HttpIncoming<T extends HttpAuthRequest | HttpRequest> = T & {
  /**
   * Request tracking Id.
   */
  requestId: string;

  /**
   * Request timestamp.
   */
  timestamp: Date;

  /**
   * Request method.
   */
  method: string;

  /**
   * Request path.
   */
  path: string;
};

/**
 * Request listener.
 */
export type HttpListener<T extends HttpAuthRequest | HttpRequest> = (
  event: Service.Event<HttpIncoming<T>>,
  context: Service.Context<Http.Service>
) => Promise<void> | void;

/**
 * Request authorizer.
 */
export type HttpAuthorizer<T extends HttpAuthRequest> = (
  request: HttpIncoming<T> | T,
  context: Service.Context<Http.Service>
) => Promise<HttpAuthResponse> | HttpAuthResponse;

/**
 * Request handler.
 */
export type HttpHandler<T extends HttpRequest> = (
  request: HttpIncoming<T> | T,
  context: Service.Context<Http.Service>
) => Promise<HttpResponse> | HttpResponse;
