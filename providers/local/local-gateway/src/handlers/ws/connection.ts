import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { WsService } from '@ez4/gateway/library';
import type { WsProviderConnection } from '@ez4/server';
import type { Ws } from '@ez4/gateway';

import { RequestType } from '../../worker/invoker';
import { invokeGatewayModule } from '../module';

export const enum WsConnectionType {
  Connect = 'connect',
  Disconnect = 'disconnect'
}

export const processWsConnection = async (
  service: WsService,
  options: ServeOptions,
  context: EmulateServiceContext,
  type: WsConnectionType,
  connection: WsProviderConnection,
  identity?: Ws.Identity
) => {
  const { services, connect, disconnect, defaults } = service;

  const target = type === WsConnectionType.Connect ? connect : disconnect;

  await invokeGatewayModule(
    options,
    context,
    {
      handler: target.handler,
      listener: target.listener ?? defaults?.listener,
      timeout: target.timeout ?? defaults?.timeout,
      memory: target.memory ?? defaults?.memory,
      services,
      variables: {
        ...service.variables,
        ...target.variables
      },
      invoker: {
        type: RequestType.WsConnection,
        request: target.handler.request,
        preferences: target.preferences ?? defaults?.preferences
      }
    },
    {
      connectionId: connection.id,
      headers: connection.headers,
      query: connection.query,
      identity
    }
  );
};
