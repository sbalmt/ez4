/**
 * Incoming request headers.
 */
export interface HttpHeaders {}

/**
 * Incoming request path parameters.
 */
export interface HttpPathParameters {}

/**
 * Incoming request query strings.
 */
export interface HttpQueryStrings {}

/**
 * Incoming body payload.
 */
export interface HttpJsonBody {}

/**
 * Request Identity payload.
 */
export interface HttpIdentity {}

/**
 * HTTP auth request.
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

/**
 * HTTP authorizer response.
 */
export interface HttpAuthResponse {
  /**
   * Authorization identity.
   */
  identity?: HttpIdentity;
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
