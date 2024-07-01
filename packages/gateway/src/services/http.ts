import type { Service } from '@ez4/common';
import type { ArrayRest, IsArrayEmpty } from '@ez4/utils';
import type { LinkedVariables } from '@ez4/project';
import type { HttpPath } from '../types/path.js';

// Helper type to unfold a route for each request type.
type RouteList<T extends Http.Request[], U extends Http.Response> =
  IsArrayEmpty<T> extends true ? never : Http.Route<T[0], U> | RouteList<ArrayRest<T>, U>;

/**
 * Provide all contracts for a self-managed HTTP service.
 */
export namespace Http {
  /**
   * Definition of path parameters.
   */
  export interface PathParameters {}

  /**
   * Definition of query string.
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
     * @param request Incoming request.
     * @param context Handler context.
     * @returns Outgoing response.
     */
    handler: (request: T, context: Service.Context<Service<[any], U>>) => U | Promise<U>;

    /**
     * Variables associated to the route.
     */
    variables?: LinkedVariables;
  }

  /**
   * HTTP service.
   */
  export declare abstract class Service<
    T extends Request[] = [Request],
    U extends Response = Response
  > implements Service.Provider<never>
  {
    /**
     * Unique and immutable service Id.
     */
    abstract id: string;

    /**
     * Service name.
     */
    abstract name: string;

    /**
     * All expected routes.
     */
    abstract routes: RouteList<T, U>[];

    /**
     * Variables associated to all the routes.
     */
    variables: LinkedVariables;

    /**
     * Service client (used only for type inference).
     */
    client: never;
  }
}
