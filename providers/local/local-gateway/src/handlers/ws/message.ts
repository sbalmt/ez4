import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { WsService } from '@ez4/gateway/library';
import type { WsProviderMessage } from '@ez4/server';
import type { Ws } from '@ez4/gateway';

import { RequestType } from '../../worker/invoker';
import { invokeGatewayModule } from '../module';

export const processWsMessage = async (
  service: WsService,
  options: ServeOptions,
  context: EmulateServiceContext,
  message: WsProviderMessage,
  identity?: Ws.Identity
) => {
  const { message: route, defaults, services } = service;
  const { handler, preferences = defaults?.preferences } = route;

  return invokeGatewayModule<string | undefined>(
    options,
    context,
    {
      handler,
      listener: route.listener ?? defaults?.listener,
      timeout: route.timeout ?? defaults?.timeout,
      memory: route.memory ?? defaults?.memory,
      services,
      variables: {
        ...service.variables,
        ...route.variables
      },
      invoker: {
        type: RequestType.WsMessage,
        request: handler.request,
        response: handler.response,
        preferences
      }
    },
    {
      connectionId: message.client.id,
      body: message.body.toString(),
      identity
    }
  );
};
