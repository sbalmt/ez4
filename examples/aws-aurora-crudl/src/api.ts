import type { Http } from '@ez4/gateway';
import type { Environment } from '@ez4/common';
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

  services: {
    auroraDb: Environment.Service<Db>;
  };
}
