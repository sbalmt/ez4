import type { Http } from '@ez4/gateway';
import type { publicRequestHandler, privateRequestHandler } from './handlers.js';
import type { headerRequestAuthorizer, queryRequestAuthorizer } from './authorizer.js';
import type { PublicRequest, PrivateRequest } from './types.js';

/**
 * Example of AWS API deployed with EZ4.
 */
export declare class ApiExample extends Http.Service<[PublicRequest, PrivateRequest]> {
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
      handler: typeof publicRequestHandler;
    },
    {
      path: 'GET /private-header-route';
      handler: typeof privateRequestHandler;
      authorizer: typeof headerRequestAuthorizer;
    },
    {
      path: 'GET /private-query-route';
      handler: typeof privateRequestHandler;
      authorizer: typeof queryRequestAuthorizer;
    }
  ];
}
