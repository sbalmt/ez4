import type { Service } from '@ez4/common';
import type { LinkedVariables } from '@ez4/project';
import type { RouteTypes } from './helpers.js';
import type { HttpPath } from '../types/path.js';

/**
 * Provide all contracts for a self-managed HTTP service.
 */
export namespace Http {
  /**
   * Definition of path parameters.
   */
  export interface PathParameters {}

  /**
   * Definition of query strings.
   */
  export interface QueryStrings {}

  /**
   * Definition of a JSON body.
   */
  export interface JsonBody {}

  /**
   * HTTP request.
   */
  export interface Request {
    /**
     * Expected fields for query strings.
     */
    query?: QueryStrings;

    /**
     * Expected field for path parameters.
     */
    parameters?: PathParameters;

    /**
     * Expected field for body payload.
     */
    body?: JsonBody;
  }

  /**
   * Incoming request cookies.
   */
  export type Cookies = string[];

  /**
   * Incoming request headers.
   */
  export type Headers = Record<string, string | undefined>;

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

    /**
     * Request headers.
     */
    headers: Headers;

    /**
     * Request cookies.
     */
    cookies?: Cookies;
  };

  /**
   * Incoming request handler.
   */
  export type Handler<T extends Request, U extends Response> = (
    request: T,
    context: Service.Context<Service<any, U>>
  ) => Promise<U> | U;

  /**
   * HTTP response.
   */
  export interface Response {
    /**
     * Response status code.
     */
    status: number;

    /**
     * Response body.
     */
    body?: JsonBody;
  }

  /**
   * HTTP route.
   */
  export interface Route<T extends Request = Request, U extends Response = Response> {
    /**
     * Route path.
     */
    path: HttpPath;

    /**
     * Route handler.
     *
     * @param request Incoming request.
     * @param context Handler context.
     * @returns Outgoing response.
     */
    handler: Handler<T, U> | Handler<Incoming<T>, U>;

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
    variables: LinkedVariables;

    /**
     * Service client.
     */
    client: never;
  }
}
