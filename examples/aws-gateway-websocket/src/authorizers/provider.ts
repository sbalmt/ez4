import type { Environment } from '@ez4/common';
import type { Ws } from '@ez4/gateway';

/**
 * Example of an authorization provider.
 */
export interface WsAuthProvider extends Ws.AuthProvider {
  variables: {
    CONNECTION_TOKEN: Environment.VariableOrValue<'SUPER_SECRET_TOKEN', 'query-connection-token'>;
  };

  services: {
    variables: Environment.ServiceVariables;
  };
}
