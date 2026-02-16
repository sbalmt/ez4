import type { Http } from '@ez4/gateway';

import type { sendEmailHandler } from './endpoints/send';

/**
 * All HTTP routes.
 */
export type AllRoutes = [
  Http.UseRoute<{
    path: 'POST /send-email';
    handler: typeof sendEmailHandler;
  }>
];
