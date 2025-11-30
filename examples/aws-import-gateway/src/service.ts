import type { Http } from '@ez4/gateway';
import type { testHandler } from './endpoints/test';

/**
 * Example of AWS API deployed with EZ4.
 */
export declare class Api extends Http.Service {
  /**
   * Display name for this API.
   */
  name: 'Local AWS API';

  /**
   * All API routes.
   */
  routes: [
    Http.UseRoute<{
      path: 'GET /test-route';
      handler: typeof testHandler;
    }>
  ];
}
