import type { headerAuthorizer } from './authorizers/header';
import type { queryAuthorizer } from './authorizers/query';
import type { publicHandler } from './endpoints/public';
import type { privateHandler } from './endpoints/private';

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
