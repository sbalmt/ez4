import type { EmulateServiceContext, EmulatorConnectionEvent, ServeOptions } from '@ez4/project/library';
import type { WsService } from '@ez4/gateway/library';
import type { Ws } from '@ez4/gateway';

import { RequestType } from '../../worker/invoker';
import { invokeGatewayModule } from '../module';

export const processWsConnection = async (
  service: WsService,
  options: ServeOptions,
  context: EmulateServiceContext,
  event: EmulatorConnectionEvent,
  identity?: Ws.Identity
) => {
  const { services, connect, disconnect, defaults } = service;
  const { connection } = event;

  const target = connection.live ? connect : disconnect;

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
      headers: event.headers,
      query: event.query,
      identity
    }
  );
};
