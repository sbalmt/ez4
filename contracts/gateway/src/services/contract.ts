import type { Service as CommonService } from '@ez4/common';
import type { LinkedVariables } from '@ez4/project/library';
import type { HttpSuccessStatuses, HttpSuccessEmptyResponse, HttpSuccessResponse } from './utils';
import type { HttpAuthorization } from './authorization';
import type { HttpPreferences } from './preferences';
import type { HttpDefaults } from './defaults';
import type { HttpProvider } from './provider';
import type { HttpAccess } from './access';
import type { HttpRoute } from './route';
import type { HttpCache } from './cache';
import type { HttpCors } from './cors';
import type { Client } from './client';

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
  HttpIncoming,
  HttpListener,
  HttpAuthorizer,
  HttpHandler
} from './common';

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

  export type Authorization = HttpAuthorization;
  export type Preferences = HttpPreferences;

  export type AuthRequest = HttpAuthRequest;
  export type Request = HttpRequest;

  export type AuthResponse = HttpAuthResponse;
  export type Response = HttpResponse;

  export type Errors = HttpErrors;
  export type Provider = HttpProvider;

  export type Cache = HttpCache;
  export type Access = HttpAccess;
  export type Cors = HttpCors;

  export type Incoming<T extends Request | AuthRequest> = HttpIncoming<T>;

  export type Listener<T extends Request | AuthRequest> = HttpListener<T>;
  export type Authorizer<T extends AuthRequest> = HttpAuthorizer<T>;
  export type Handler<T extends Request> = HttpHandler<T>;

  export type Route<T extends Request = Request, U extends AuthRequest = AuthRequest> = HttpRoute<T, U>;
  export type Defaults<T extends HttpRequest | HttpAuthRequest = any> = HttpDefaults<T>;

  export type ServiceEvent<T extends Request | AuthRequest = Request> = CommonService.AnyEvent<Incoming<T>>;

  export type SuccessEmptyResponse<S extends HttpSuccessStatuses = 204> = HttpSuccessEmptyResponse<S>;
  export type SuccessResponse<S extends HttpSuccessStatuses, T extends HttpRawBody | HttpJsonBody> = HttpSuccessResponse<S, T>;

  /**
   * HTTP Route definition.
   */
  export type UseRoute<T extends Route<any, any>> = T;

  /**
   * HTTP Service definition.
   */
  export type UseDefaults<T extends Defaults<any>> = T;

  /**
   * HTTP Preferences definition.
   */
  export type UsePreferences<T extends Preferences> = T;

  /**
   * HTTP Authorization definition.
   */
  export type UseAuthorization<T extends Authorization> = T;

  /**
   * HTTP Cache definition.
   */
  export type UseCache<T extends Cache> = T;

  /**
   * HTTP Access definition.
   */
  export type UseAccess<T extends Access> = T;

  /**
   * HTTP CORS definition.
   */
  export type UseCors<T extends Cors> = T;

  /**
   * HTTP service.
   */
  export declare abstract class Service implements CommonService.Provider {
    /**
     * All expected routes.
     */
    abstract readonly routes: Route<any, any>[];

    /**
     * Display name for the service.
     */
    readonly name?: string;

    /**
     * Default parameters.
     */
    readonly defaults?: Defaults<any>;

    /**
     * CORS configuration.
     */
    readonly cors?: Cors;

    /**
     * Cache configuration.
     */
    readonly cache?: Cache;

    /**
     * Access configuration.
     */
    readonly access?: Access;

    /**
     * Variables associated to all routes.
     */
    readonly variables?: LinkedVariables;

    /**
     * Service client.
     */
    readonly client: Client<Service>;
  }

  /**
   * Imported HTTP service.
   */
  export declare abstract class Import<T extends Service> implements CommonService.Provider {
    /**
     * Name of the imported project defined in the project options file.
     */
    abstract readonly project: string;

    /**
     * Imported service reference.
     */
    readonly reference: T;

    /**
     * Authorization configuration.
     */
    readonly authorization?: Authorization;

    /**
     * All routes attached to the imported service (do not replace).
     */
    readonly routes: T['routes'];

    /**
     * Display name for the service imported service (do not replace).
     */
    readonly name: T['name'];

    /**
     * All default configurations attached to the imported service (do not replace).
     */
    readonly defaults: T['defaults'];

    /**
     * Imported service client (do not replace).
     */
    readonly client: Client<T>;

    /**
     * Variables are not allowed.
     */
    readonly variables: never;

    /**
     * Services are not allowed.
     */
    readonly service: never;
  }
}
