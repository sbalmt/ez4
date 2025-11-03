import type { Environment } from '@ez4/common';
import type { Http } from '@ez4/gateway';

/**
 * Example of API provider.
 */
export interface ApiProvider extends Http.Provider {
  /**
   * Environment variables for all handlers.
   */
  variables: {
    TEST_VAR1: 'hello-world';
  };

  /**
   * All services in the context provider.
   */
  services: {
    selfVariables: Environment.ServiceVariables;
  };
}
