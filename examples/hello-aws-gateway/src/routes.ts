import type { CustomError } from './errors';

import type { postHandler } from './endpoints/post';
import type { patchHandler } from './endpoints/patch';
import type { putHandler } from './endpoints/put';
import type { getHandler } from './endpoints/get';
import type { deleteHandler } from './endpoints/delete';
import type { rawHandler } from './endpoints/raw';

/**
 * Map HTTP status codes to known errors.
 */
export type ApiErrors = {
  422: [CustomError];
};

/**
 * All HTTP routes.
 */
export type AllRoutes = [
  {
    /**
     * How the route is available in the API clients and documentation.
     */
    name: 'postRoute';

    /**
     * Path of the route.
     */
    path: 'POST /post-route';

    /**
     * Function that will handle route requests.
     */
    handler: typeof postHandler;

    /**
     * HTTP errors mapping exceptions to status codes.
     */
    httpErrors: ApiErrors;

    /**
     * Include route configuration in the CORS configuration.
     */
    cors: true;
  },
  {
    name: 'patchRoute';
    path: 'PATCH /patch-route/{id}';
    handler: typeof patchHandler;
    httpErrors: ApiErrors;
    cors: true;
  },
  {
    name: 'putRoute';
    path: 'PUT /put-route/{id}';
    handler: typeof putHandler;
    cors: true;
  },
  {
    name: 'getRoute';
    path: 'GET /get-route/{id}';
    handler: typeof getHandler;
    cors: true;
  },
  {
    name: 'deleteRoute';
    path: 'DELETE /delete-route/{id}';
    handler: typeof deleteHandler;
    cors: true;
  },
  {
    name: 'rawRoute';
    path: 'ANY /raw-route/{proxy+}';
    handler: typeof rawHandler;
  }
];
