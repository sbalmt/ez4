import type { postHandler } from './endpoints/post.js';
import type { patchHandler } from './endpoints/patch.js';
import type { putHandler } from './endpoints/put.js';
import type { getHandler } from './endpoints/get.js';
import type { deleteHandler } from './endpoints/delete.js';

export type AllRoutes = [
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
