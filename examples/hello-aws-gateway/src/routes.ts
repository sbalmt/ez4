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
    path: 'POST /post-route';
    handler: typeof postHandler;
    httpErrors: ApiErrors;
    cors: true;
  },
  {
    path: 'PATCH /patch-route/{id}';
    handler: typeof patchHandler;
    httpErrors: ApiErrors;
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
  },
  {
    path: 'ANY /raw-route/{proxy+}';
    handler: typeof rawHandler;
  }
];
