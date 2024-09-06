import type { Http } from '@ez4/gateway';
import type { GetRequest, PostRequest } from './types.js';
import type { getHandler, postHandler } from './handlers.js';

/**
 * Example of AWS API deployed with EZ4.
 */
export declare class Api extends Http.Service<[PostRequest, GetRequest]> {
  /**
   * Display name for this API.
   */
  name: 'Hello AWS API';

  /**
   * All API routes.
   */
  routes: [
    {
      path: 'POST /post-route';
      handler: typeof postHandler;
    },
    {
      path: 'GET /get-route/{id}';
      handler: typeof getHandler;
    }
  ];
}
