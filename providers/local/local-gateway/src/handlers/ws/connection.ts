import type { EmulateServiceContext, EmulatorConnectionEvent, ServeOptions } from '@ez4/project/library';
import type { ValidationCustomContext } from '@ez4/validator';
import type { WsService } from '@ez4/gateway/library';
import type { Ws } from '@ez4/gateway';

import { createModule, onBegin, onReady, onDone, onError, onEnd } from '@ez4/local-common';
import { resolveValidation } from '@ez4/gateway/utils';
import { getRandomUUID } from '@ez4/utils';

import { getIncomingRequestIdentity, getIncomingRequestHeaders, getIncomingRequestQuery } from '../../utils/request';

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
  const handler = target.handler;

  const clients = await context.makeClients(services);

  const module = await createModule({
    listener: target.listener ?? defaults?.listener,
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

  const onCustomValidation = (value: unknown, context: ValidationCustomContext) => {
    return resolveValidation(value, clients, context.type);
  };

  try {
    await onBegin(module, clients, request);

    if (handler.request) {
      Object.assign(request, await getIncomingRequestIdentity(handler.request, identity, onCustomValidation));
      Object.assign(request, await getIncomingRequestHeaders(handler.request, event, onCustomValidation));
      Object.assign(request, await getIncomingRequestQuery(handler.request, event, onCustomValidation));
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
