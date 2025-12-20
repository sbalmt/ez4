import type { Environment } from '@ez4/common';
import type { Http } from '@ez4/gateway';

export declare class AuthProvider implements Http.AuthProvider {
  /**
   * Variables exposed to authorizers using the provider.
   */
  variables: {
    SUPER_SECRET_API_KEY: Environment.Variable<'SUPER_SECRET_API_KEY'>;
  };

  /**
   * Services exposed to authorizers using the provider.
   */
  services: {
    variables: Environment.ServiceVariables;
  };
}
