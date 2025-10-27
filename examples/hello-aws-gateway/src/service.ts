import type { Http } from '@ez4/gateway';
import type { apiListener } from './listener';
import type { AllRoutes } from './routes';

/**
 * Example of AWS API deployed with EZ4.
 */
export declare class Api extends Http.Service {
  /**
   * Display name for this API.
   */
  name: 'Hello AWS API';

  /**
   * Default API settings.
   */
  defaults: {
    listener: typeof apiListener;
  };

  /**
   * Access configuration.
   */
  access: {
    logRetention: 14;
  };

  /**
   * All API routes.
   */
  routes: [...AllRoutes];

  /**
   * Cors configuration.
   */
  cors: {
    allowOrigins: ['http://localhost:3000'];
  };
}
