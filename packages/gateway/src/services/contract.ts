import type { Service } from '@ez4/common';
import type { LinkedVariables } from '@ez4/project/library';
import type { HttpPath } from '../types/path.js';

import type {
  HttpHeaders,
  HttpPathParameters,
  HttpQueryStrings,
  HttpJsonBody,
  HttpIdentity,
  HttpAuthRequest,
  HttpAuthResponse,
  HttpRequest,
  HttpResponse,
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

  export type AuthRequest = HttpAuthRequest;
  export type Request = HttpRequest;

  export type AuthResponse = HttpAuthResponse;
  export type Response = HttpResponse;

  export type Cors = HttpCors;

  /**
   * Incoming request.
   */
  export type Incoming<T extends Request> = T & {
    /**
     * Request Id.
     */
    requestId: string;

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
   * Incoming request authorizer.
   */
  export type Authorizer<T extends AuthRequest> = (
    request: T,
    context: Service.Context<Service>
  ) => Promise<AuthResponse> | AuthResponse;

  /**
   * Incoming request handler.
   */
  export type Handler<T extends Request> = (
    request: T,
    context: Service.Context<Service>
  ) => Promise<Response> | Response;

  /**
   * HTTP route.
   */
  export interface Route {
    /**
     * Route path.
     */
    path: HttpPath;

    /**
     * Route authorizer.
     */
    authorizer?: Authorizer<any>;

    /**
     * Route handler.
     */
    handler: Handler<any> | Handler<Incoming<any>>;

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

    /**
     * Determines whether or not CORS is enabled for the route.
     */
    cors?: boolean;
  }

  /**
   * HTTP service.
   */
  export declare abstract class Service implements Service.Provider {
    /**
     * All expected routes.
     */
    abstract routes: Route[];

    /**
     * Display name for the service.
     */
    name?: string;

    /**
     * CORS configuration.
     */
    cors?: Cors;

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
