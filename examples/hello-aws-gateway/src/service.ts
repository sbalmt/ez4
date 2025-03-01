import type { Http } from '@ez4/gateway';
import type { postHandler } from './endpoints/post.js';
import type { getHandler } from './endpoints/get.js';

/**
 * Example of AWS API deployed with EZ4.
 */
export declare class Api extends Http.Service {
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
      cors: true;
    },
    {
      path: 'GET /get-route/{id}';
      handler: typeof getHandler;
      cors: true;
    }
  ];

  /**
   * Cors configuration.
   */
  cors: {
    allowOrigins: ['http://localhost:3000'];
  };
}
