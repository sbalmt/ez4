import type { EmulateServiceContext, EmulatorConnectionEvent, ServeOptions } from '@ez4/project/library';
import type { WsService } from '@ez4/gateway/library';
import type { Ws } from '@ez4/gateway';

import { RequestType } from '../../worker/invoker';
import { invokeGatewayModule } from '../module';

export const processWsAuthorization = async (
  service: WsService,
  options: ServeOptions,
  context: EmulateServiceContext,
  event: EmulatorConnectionEvent
): Promise<Ws.Identity | undefined> => {
  const { connect, defaults } = service;
  const { authorizer } = connect;

  if (!authorizer) {
    return undefined;
  }

  const { provider } = authorizer;

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
        request: authorizer.request,
        preferences: connect.preferences ?? defaults?.preferences
      }
    },
    {
      connectionId: event.connection.id,
      headers: event.headers,
      query: event.query
    }
  );

  return response?.identity;
};
