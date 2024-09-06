import type { Http } from '@ez4/gateway';
import type { publicHandler, privateHandler } from './handlers.js';
import type { headerAuthorizer, queryAuthorizer } from './authorizer.js';
import type { PublicRequest, PrivateRequest } from './types.js';

/**
 * Example of AWS API deployed with EZ4.
 */
export declare class Api extends Http.Service<[PublicRequest, PrivateRequest]> {
  /**
   * Display name for this API.
   */
  name: 'AWS API Authorizer';

  /**
   * All API routes.
   */
  routes: [
    {
      path: 'GET /public-route';
      handler: typeof publicHandler;
    },
    {
      path: 'GET /private-header-route';
      handler: typeof privateHandler;
      authorizer: typeof headerAuthorizer;
    },
    {
      path: 'GET /private-query-route';
      handler: typeof privateHandler;
      authorizer: typeof queryAuthorizer;
    }
  ];
}
