import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { WsService } from '@ez4/gateway/library';
import type { WsProviderConnection } from '@ez4/server';
import type { Ws } from '@ez4/gateway';

import { RequestType } from '../../worker/invoker';
import { invokeGatewayModule } from '../module';

export const processWsAuthorization = async (
  service: WsService,
  options: ServeOptions,
  context: EmulateServiceContext,
  connection: WsProviderConnection
): Promise<Ws.Identity | undefined> => {
  const { connect, defaults } = service;
  const { authorizer } = connect;

  if (!authorizer) {
    return undefined;
  }

  const { provider } = authorizer;

  const targetPreferences = connect.preferences ?? defaults?.preferences;

  const response = await invokeGatewayModule<Ws.AuthResponse>(
    options,
    context,
    {
      listener: connect.listener ?? defaults?.listener,
      handler: authorizer,
      services: provider?.services,
      timeout: connect.timeout ?? defaults?.timeout,
      memory: connect.memory ?? defaults?.memory,
      variables: {
        ...service.variables,
        ...connect.variables,
        ...provider?.variables
      },
      invoker: {
        type: RequestType.WsAuthorizer,
        preferences: targetPreferences,
        request: authorizer.request
      }
    },
    {
      connectionId: connection.id,
      headers: connection.headers,
      query: connection.query
    }
  );

  return response?.identity;
};
