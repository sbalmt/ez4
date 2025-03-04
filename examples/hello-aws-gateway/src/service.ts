import type { Http } from '@ez4/gateway';
import type { postHandler } from './endpoints/post.js';
import type { patchHandler } from './endpoints/patch.js';
import type { putHandler } from './endpoints/put.js';
import type { getHandler } from './endpoints/get.js';
import type { deleteHandler } from './endpoints/delete.js';
import type { catchErrors } from './common.js';

/**
 * Example of AWS API deployed with EZ4.
 */
export declare class Api extends Http.Service {
  /**
   * Display name for this API.
   */
  name: 'Hello AWS API';

  /**
   * Default API settings.
   */
  defaults: {
    catcher: typeof catchErrors;
  };

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
      path: 'PATCH /patch-route/{id}';
      handler: typeof patchHandler;
      cors: true;
    },
    {
      path: 'PUT /put-route/{id}';
      handler: typeof putHandler;
      cors: true;
    },
    {
      path: 'GET /get-route/{id}';
      handler: typeof getHandler;
      cors: true;
    },
    {
      path: 'DELETE /delete-route/{id}';
      handler: typeof deleteHandler;
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
