import type { Service } from '@ez4/common';
import type { LinkedVariables } from '@ez4/project/library';
import type { HttpPath } from '../types/common.js';
import type { HttpSuccessStatuses, HttpEmptySuccessResponse, HttpSuccessResponse } from './utils.js';

import type {
  HttpHeaders,
  HttpIdentity,
  HttpPathParameters,
  HttpQueryStrings,
  HttpJsonBody,
  HttpRawBody,
  HttpAuthRequest,
  HttpAuthResponse,
  HttpRequest,
  HttpResponse,
  HttpErrors,
  HttpProvider,
  HttpIncoming,
  HttpListener,
  HttpAuthorizer,
  HttpHandler,
  HttpCache,
  HttpCors
} from './common.js';

/**
 * Provide all contracts for a self-managed HTTP service.
 */
export namespace Http {
  export type Headers = HttpHeaders;
  export type Identity = HttpIdentity;

  export type PathParameters = HttpPathParameters;
  export type QueryStrings = HttpQueryStrings;
  export type JsonBody = HttpJsonBody;
  export type RawBody = HttpRawBody;

  export type AuthRequest = HttpAuthRequest;
  export type Request = HttpRequest;

  export type AuthResponse = HttpAuthResponse;
  export type Response = HttpResponse;

  export type Errors = HttpErrors;
  export type Provider = HttpProvider;

  export type Cache = HttpCache;
  export type Cors = HttpCors;

  export type Incoming<T extends Request | AuthRequest> = HttpIncoming<T>;

  export type Listener<T extends Request | AuthRequest> = HttpListener<T>;
  export type Authorizer<T extends AuthRequest> = HttpAuthorizer<T>;
  export type Handler<T extends Request> = HttpHandler<T>;

  export type ServiceEvent<T extends Request | AuthRequest = Request> = Service.Event<Incoming<T>>;

  export type EmptySuccessResponse<S extends HttpSuccessStatuses = 204> = HttpEmptySuccessResponse<S>;
  export type SuccessResponse<S extends HttpSuccessStatuses, T extends HttpRawBody | HttpJsonBody> = HttpSuccessResponse<S, T>;

  /**
   * HTTP route.
   */
  export interface Route<T extends Request = Request, U extends AuthRequest = AuthRequest> {
    /**
     * Route path.
     */
    path: HttpPath;

    /**
     * Route listener.
     */
    listener?: Listener<T | U>;

    /**
     * Route authorizer.
     */
    authorizer?: Authorizer<U>;

    /**
     * Route handler.
     */
    handler: Handler<T>;

    /**
     * Default log retention (in days) for the handlers.
     */
    logRetention?: number;

    /**
     * Map status codes and errors for all known exceptions.
     */
    httpErrors?: Errors;

    /**
     * Variables associated to the route.
     */
    variables?: LinkedVariables;

    /**
     * Max execution time (in seconds) for the route.
     */
    timeout?: number;

    /**
     * Amount of memory available for the handler.
     */
    memory?: number;

    /**
     * Determines whether or not CORS is enabled for the route.
     */
    cors?: boolean;
  }

  /**
   * Default HTTP service parameters.
   */
  export type Defaults<T extends Request | AuthRequest = {}> = {
    /**
     * Default route listener.
     */
    listener?: Listener<T>;

    /**
     * Status codes for all known exceptions.
     */
    httpErrors?: Errors;

    /**
     * Default log retention (in days) for the handlers.
     */
    logRetention?: number;

    /**
     * Default execution time (in seconds) for handlers and routes.
     */
    timeout?: number;

    /**
     * Default amount of memory available for handlers.
     */
    memory?: number;
  };

  /**
   * HTTP service.
   */
  export declare abstract class Service implements Service.Provider {
    /**
     * All expected routes.
     */
    abstract routes: Route<any, any>[];

    /**
     * Display name for the service.
     */
    name?: string;

    /**
     * Default parameters.
     */
    defaults?: Defaults;

    /**
     * CORS configuration.
     */
    cors?: Cors;

    /**
     * Cache configuration.
     */
    cache?: Cache;

    /**
     * Variables associated to all routes.
     */
    variables?: LinkedVariables;

    /**
     * Service client.
     */
    client: never;
  }
}
