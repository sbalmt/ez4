import type { Service } from '@ez4/common';
import type { LinkedVariables } from '@ez4/project/library';
import type { HttpPath } from '../types/path.js';
import type { HttpAuthResponse, HttpResponse } from './response.js';
import type { HttpRequest, HttpAuthRequest } from './request.js';
import type { RouteTypes } from './helpers.js';

import type {
  HttpHeaders,
  HttpIdentity,
  HttpPathParameters,
  HttpQueryStrings,
  HttpJsonBody
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

  export type AuthRequest = HttpAuthRequest;
  export type Request = HttpRequest;

  export type AuthResponse = HttpAuthResponse;
  export type Response = HttpResponse;

  /**
   * Incoming request.
   */
  export type Incoming<T extends Request> = T & {
    /**
     * Request Id.
     */
    requestId: string;

    /**
     * Request path.
     */
    path: string;

    /**
     * Request method.
     */
    method: string;
  };

  /**
   * Incoming request authorizer.
   */
  export type Authorizer<T extends AuthRequest, U extends AuthResponse> = (
    request: T,
    context: Service.Context<Service<any, any>>
  ) => Promise<U> | U;

  /**
   * Incoming request handler.
   */
  export type Handler<T extends Request, U extends Response> = (
    request: T,
    context: Service.Context<Service<any, U>>
  ) => Promise<U> | U;

  /**
   * HTTP route.
   */
  export interface Route<I extends Request = Request, O extends Response = Response> {
    /**
     * Route path.
     */
    path: HttpPath;

    /**
     * Route authorizer.
     */
    authorizer?: Authorizer<any, any>;

    /**
     * Route handler.
     */
    handler: Handler<I, O> | Handler<Incoming<I>, O>;

    /**
     * Variables associated to the route.
     */
    variables?: LinkedVariables;

    /**
     * Max route execution time (in seconds) for the route.
     */
    timeout?: number;

    /**
     * Amount of memory available for the handler.
     */
    memory?: number;
  }

  /**
   * HTTP service.
   */
  export declare abstract class Service<
    T extends Request[] = Request[],
    U extends Response = Response
  > implements Service.Provider
  {
    /**
     * All expected routes.
     */
    abstract routes: RouteTypes<T, U>[];

    /**
     * Display name for the service.
     */
    name?: string;

    /**
     * Variables associated to all the routes.
     */
    variables?: LinkedVariables;

    /**
     * Service client.
     */
    client: never;
  }
}
