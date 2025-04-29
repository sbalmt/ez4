import type { Http } from '@ez4/gateway';
import type { Environment } from '@ez4/common';
import type { AllRoutes } from './api/routes.js';
import type { Db } from './dynamo.js';

/**
 * Example of AWS API deployed with EZ4.
 */
export declare class Api extends Http.Service {
  /**
   * Display name for this API.
   */
  name: 'DynamoDB CRUDL API';

  /**
   * All API routes.
   */
  routes: [...AllRoutes];

  services: {
    dynamoDb: Environment.Service<Db>;
  };
}
