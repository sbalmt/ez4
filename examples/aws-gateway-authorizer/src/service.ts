import type { Http } from '@ez4/gateway';
import type { headerAuthorizer } from './authorizers/header.js';
import type { queryAuthorizer } from './authorizers/query.js';
import type { publicHandler } from './endpoints/public.js';
import type { privateHandler } from './endpoints/private.js';

/**
 * Example of AWS API deployed with EZ4.
 */
export declare class Api extends Http.Service {
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
      authorizer: typeof headerAuthorizer;
      handler: typeof privateHandler;
    },
    {
      path: 'GET /private-query-route';
      authorizer: typeof queryAuthorizer;
      handler: typeof privateHandler;
    }
  ];
}
