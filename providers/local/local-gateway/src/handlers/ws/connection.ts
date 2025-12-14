import type { EmulateServiceContext, EmulatorConnectionEvent, ServeOptions } from '@ez4/project/library';
import type { WsService } from '@ez4/gateway/library';
import type { Ws } from '@ez4/gateway';

import { createModule, onBegin, onReady, onDone, onError, onEnd } from '@ez4/local-common';
import { getRandomUUID } from '@ez4/utils';

import { getIncomingRequestIdentity, getIncomingRequestHeaders, getIncomingRequestQuery } from '../../utils/request';

export const processWsConnection = async (
  service: WsService,
  options: ServeOptions,
  context: EmulateServiceContext,
  event: EmulatorConnectionEvent,
  identity?: Ws.Identity
) => {
  const { connection } = event;

  const target = connection.live ? service.connect : service.disconnect;
  const handler = target.handler;

  const clients = service.services && context.makeClients(service.services);

  const module = await createModule({
    listener: target.listener ?? service.defaults?.listener,
    version: options.version,
    handler,
    variables: {
      ...options.variables,
      ...service.variables,
      ...target.variables
    }
  });

  const request: Ws.Incoming<Ws.Event> = {
    connectionId: connection.id,
    requestId: getRandomUUID(),
    timestamp: new Date()
  };

  try {
    await onBegin(module, clients, request);

    if (handler.request) {
      Object.assign(request, await getIncomingRequestIdentity(handler.request, identity));
      Object.assign(request, await getIncomingRequestHeaders(handler.request, event));
      Object.assign(request, await getIncomingRequestQuery(handler.request, event));
    }

    await onReady(module, clients, request);

    await module.handler(request, clients);

    await onDone(module, clients, request);

    //
  } catch (error) {
    await onError(module, clients, request, error);

    throw error;
    //
  } finally {
    await onEnd(module, clients, request);
  }
};
