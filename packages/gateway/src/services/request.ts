import type {
  HttpHeaders,
  HttpIdentity,
  HttpPathParameters,
  HttpQueryStrings,
  HttpJsonBody
} from './common.js';

/**
 * HTTP authorizer request.
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
