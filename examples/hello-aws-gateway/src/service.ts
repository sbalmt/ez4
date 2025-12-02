import type { NamingStyle } from '@ez4/schema';
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
  defaults: Http.UseDefaults<{
    /**
     * Set the default listener for the request life-cycle events.
     */
    listener: typeof apiListener;

    /**
     * Set default preferences for the service.
     */
    preferences: {
      /**
       * Set the default naming style for request and response.
       */
      namingStyle: NamingStyle.SnakeCase;
    };
  }>;

  /**
   * Access configuration.
   */
  access: Http.UseAccess<{
    logRetention: 14;
  }>;

  /**
   * All API routes.
   */
  routes: [...AllRoutes];

  /**
   * Cors configuration.
   */
  cors: Http.UseCors<{
    allowOrigins: ['http://localhost:3000'];
  }>;
}
