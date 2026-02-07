import type { NamingStyle } from '@ez4/schema';
import type { Http } from '@ez4/gateway';
import type { AllRoutes } from './routes';

/**
 * Example of AWS API deployed with EZ4.
 */
export declare class Api extends Http.Service {
  /**
   * Display name for this API.
   */
  name: 'Hello AWS Email';

  /**
   * Default API settings.
   */
  defaults: Http.UseDefaults<{
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
   * All API routes.
   */
  routes: [...AllRoutes];
}
