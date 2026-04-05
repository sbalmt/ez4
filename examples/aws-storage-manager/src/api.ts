import type { ArchitectureType } from '@ez4/project';
import type { Http } from '@ez4/gateway';
import type { ApiRoutes } from './api/routes';

/**
 * Example of AWS API deployed with EZ4.
 */
export declare class Api extends Http.Service {
  /**
   * Display name for this API.
   */
  name: 'Storage Manager';

  /**
   * Default configuration for all routes.
   */
  defaults: Http.UseDefaults<{
    /**
     * Use ARM64 architecture.
     */
    architecture: ArchitectureType.Arm;
  }>;

  /**
   * All API routes.
   */
  routes: [...ApiRoutes];
}
