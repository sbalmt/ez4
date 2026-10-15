import type { Http } from '@ez4/gateway';

import type { setDataHandler } from './endpoints/set';
import type { getDataHandler } from './endpoints/get';

/**
 * All HTTP routes.
 */
export type AllRoutes = [
  Http.UseRoute<{
    path: 'POST /set-data';
    handler: typeof setDataHandler;
  }>,
  Http.UseRoute<{
    path: 'GET /get-data/{key}';
    handler: typeof getDataHandler;
  }>
];
