import type { headerAuthorizer } from './authorizers/header.js';
import type { queryAuthorizer } from './authorizers/query.js';
import type { publicHandler } from './endpoints/public.js';
import type { privateHandler } from './endpoints/private.js';

export type AllRoutes = [
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
