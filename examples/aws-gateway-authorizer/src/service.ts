import type { Http } from '@ez4/gateway';
import type { AllRoutes } from './routes.js';

/**
 * Example of AWS API deployed with EZ4.
 */
export declare class Api extends Http.Service {
  /**
   * Display name for this API.
   */
  name: 'AWS API Authorizer';

  /**
   * All API routes.
   */
  routes: [...AllRoutes];

  /**
   * Cache configuration.
   */
  cache: {
    authorizerTTL: 5;
  };
}
