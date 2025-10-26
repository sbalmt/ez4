import type { Http } from '@ez4/gateway';
import type { Environment } from '@ez4/common';
import type { FileStorage } from './storage';
import type { FileDb } from './dynamo';

/**
 * Example of API provider to isolate services between routes.
 */
export declare class ApiProvider implements Http.Provider {
  /**
   * All provided services.
   */
  services: {
    fileStorage: Environment.Service<FileStorage>;
    fileDb: Environment.Service<FileDb>;
  };
}
