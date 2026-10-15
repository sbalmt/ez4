import type { Environment } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { CacheService } from './cache';

/**
 * Example of API provider.
 */
export interface ApiProvider extends Http.Provider {
  /**
   * All services in the context provider.
   */
  services: {
    cacheService: Environment.Service<CacheService>;
  };
}
