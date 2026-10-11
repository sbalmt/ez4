import type { EmulateServiceContext, EmulatorMessageEvent, ServeOptions } from '@ez4/project/library';
import type { WsService } from '@ez4/gateway/library';
import type { Ws } from '@ez4/gateway';

import { RequestType } from '../../worker/invoker';
import { invokeGatewayModule } from '../module';

export const processWsMessage = async (
  service: WsService,
  options: ServeOptions,
  context: EmulateServiceContext,
  event: EmulatorMessageEvent,
  identity?: Ws.Identity
) => {
  const { message, defaults, services } = service;
  const { handler, preferences = defaults?.preferences } = message;

  return invokeGatewayModule<string | undefined>(
    options,
    context,
    {
      handler,
      listener: message.listener ?? defaults?.listener,
      timeout: message.timeout ?? defaults?.timeout,
      memory: message.memory ?? defaults?.memory,
      services,
      variables: {
        ...service.variables,
        ...message.variables
      },
      invoker: {
        type: RequestType.WsMessage,
        request: handler.request,
        response: handler.response,
        preferences
      }
    },
    {
      connectionId: event.connection.id,
      body: event.body.toString(),
      identity
    }
  );
};
