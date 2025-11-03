import type { Environment } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { ImportedApi } from './import';

/**
 * Example of API provider.
 */
export interface ApiProvider extends Http.Provider {
  /**
   * All services in the context provider.
   */
  services: {
    importedApi: Environment.Service<ImportedApi>;
  };
}
