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
 * HTTP cache.
 */
export interface HttpCache {
  /**
   * Default TTL (in seconds) for cached authorizations.
   */
  authorizerTTL: number;
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
  headers?: HttpHeaders;

  /**
   * Expected HTTP path parameters.
   */
  parameters?: HttpPathParameters;

  /**
   * Expected HTTP query strings.
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
   * Expected identity.
   */
  identity?: HttpIdentity;

  /**
   * Expected HTTP headers.
   */
  headers?: HttpHeaders;

  /**
   * Expected HTTP path parameters.
   */
  parameters?: HttpPathParameters;

  /**
   * Expected HTTP query strings.
   */
  query?: HttpQueryStrings;

  /**
   * Expected HTTP body payload.
   */
  body?: HttpJsonBody | HttpRawBody;
}

/**
 * HTTP response.
 */
export interface HttpResponse {
  /**
   * HTTP status code.
   */
  status: number;

  /**
   * HTTP headers.
   */
  headers?: HttpHeaders;

  /**
   * HTTP body payload.
   */
  body?: HttpJsonBody;
}

export interface HttpProvider {
  /**
   * All services associated to the provider.
   */
  services: Record<string, unknown>;
}

/**
 * Incoming request.
 */
export type HttpIncoming<T extends HttpRequest | HttpAuthRequest> = T & {
  /**
   * Request tracking Id.
   */
  requestId: string;

  /**
   * Determines whether request is base64 encoded or not.
   */
  encoded: boolean;

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
export type HttpListener<T extends HttpRequest | HttpAuthRequest> = (
  event: Service.Event<HttpIncoming<T>>,
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
  [code: number]: Error[];
};
