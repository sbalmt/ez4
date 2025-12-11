import type { Service as CommonService } from '@ez4/common';
import type { LinkedVariables } from '@ez4/project/library';
import type { AuthResponse as HttpAuthResponse } from '../auth/response';
import type { AuthRequest as HttpAuthRequest } from '../auth/request';
import type { WebJsonBody, WebRawBody } from '../web/body';
import type { WebPathParameters } from '../web/parameters';
import type { WebPreferences } from '../web/preferences';
import type { AuthIdentity } from '../auth/identity';
import type { WebQueryStrings } from '../web/query';
import type { WebHeaders } from '../web/headers';
import type { AuthCache } from '../auth/cache';
import type { HttpSuccessStatuses, HttpSuccessEmptyResponse, HttpSuccessResponse, HttpEmptyRequest } from './utils';
import type { HttpAuthorization } from './authorization';
import type { HttpDefaults } from './defaults';
import type { HttpProvider } from './provider';
import type { HttpListener } from './listener';
import type { HttpIncoming } from './incoming';
import type { HttpResponse } from './response';
import type { HttpRequest } from './request';
import type { HttpHandler } from './handler';
import type { HttpClient } from './client';
import type { HttpAccess } from './access';
import type { HttpErrors } from './errors';
import type { HttpRoute } from './route';
import type { HttpCors } from './cors';

/**
 * Provide all contracts for a self-managed HTTP service.
 */
export namespace Http {
  export type Headers = WebHeaders;
  export type Identity = AuthIdentity;

  export type PathParameters = WebPathParameters;
  export type QueryStrings = WebQueryStrings;
  export type JsonBody = WebJsonBody;
  export type RawBody = WebRawBody;

  export type Authorization = HttpAuthorization;
  export type Access = HttpAccess;

  export type Preferences = WebPreferences;
  export type Cache = AuthCache;

  export type Request = HttpRequest;
  export type Response = HttpResponse;

  export type AuthRequest = HttpAuthRequest;
  export type AuthResponse = HttpAuthResponse;

  export type Errors = HttpErrors;
  export type Provider = HttpProvider;
  export type Cors = HttpCors;

  export type Incoming<T extends Request> = HttpIncoming<T>;

  export type Listener<T extends Request> = HttpListener<T>;
  export type Handler<T extends Request> = HttpHandler<T>;

  export type Route<T extends Request = Request, U extends AuthRequest = AuthRequest> = HttpRoute<T, U>;

  export type Defaults<T extends Request = Request> = HttpDefaults<T>;

  export type ServiceEvent<T extends Request = Request> = CommonService.AnyEvent<Incoming<T>>;

  export type SuccessEmptyResponse<S extends HttpSuccessStatuses = 204> = HttpSuccessEmptyResponse<S>;
  export type SuccessResponse<S extends HttpSuccessStatuses, T extends JsonBody | RawBody> = HttpSuccessResponse<S, T>;
  export type EmptyRequest = HttpEmptyRequest;

  /**
   * HTTP Route definition.
   */
  export type UseRoute<T extends Route<any, any>> = T;

  /**
   * HTTP Defaults definition.
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
     * All routes associated to the gateway.
     */
    abstract readonly routes: Route<any, any>[];

    /**
     * Display name for the service.
     */
    readonly name?: string;

    /**
     * Default gateway parameters.
     */
    readonly defaults?: Defaults<any>;

    /**
     * CORS configuration for all routes.
     */
    readonly cors?: Cors;

    /**
     * Cache configuration for authorizers.
     */
    readonly cache?: Cache;

    /**
     * Access configuration for logs.
     */
    readonly access?: Access;

    /**
     * Variables associated to all routes.
     */
    readonly variables?: LinkedVariables;

    /**
     * Service client.
     */
    readonly client: HttpClient<Service>;
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
    readonly client: HttpClient<T>;

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
