import type { Environment } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { CategoryNotFound } from './api/errors/category';
import type { AllRoutes } from './api/routes';
import type { Db } from './aurora';

/**
 * Example of AWS API deployed with EZ4.
 */
export declare class Api extends Http.Service {
  /**
   * Display name for this API.
   */
  name: 'Aurora CRUDL API';

  /**
   * All API routes.
   */
  routes: [...AllRoutes];

  /**
   * Default configuration for the API.
   */
  defaults: Http.UseDefaults<{
    /**
     * Default error mapping for the API.
     */
    httpErrors: {
      [400]: [CategoryNotFound];
    };
  }>;

  /**
   * Services exposed to all handlers.
   */
  services: {
    auroraDb: Environment.Service<Db>;
  };
}
