import type { Http } from '@ez4/gateway';

import type { queryAuthorizer } from './authorizers/strategies/query';
import type { headerAuthorizer } from './authorizers/strategies/header';
import type { privateHandler } from './endpoints/private';
import type { publicHandler } from './endpoints/public';

export type AllRoutes = [
  Http.UseRoute<{
    path: 'GET /public-route';
    handler: typeof publicHandler;
  }>,
  Http.UseRoute<{
    path: 'GET /private-header-route';
    authorizer: typeof headerAuthorizer;
    handler: typeof privateHandler;
  }>,
  Http.UseRoute<{
    path: 'GET /private-query-route';
    authorizer: typeof queryAuthorizer;
    handler: typeof privateHandler;
  }>
];
