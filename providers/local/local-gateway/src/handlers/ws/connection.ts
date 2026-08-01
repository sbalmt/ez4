import type { EmulateServiceContext, EmulatorConnectionEvent, ServeOptions } from '@ez4/project/library';
import type { ValidationCustomContext } from '@ez4/validator';
import type { WsService } from '@ez4/gateway/library';
import type { Ws } from '@ez4/gateway';

import { createModule, onBegin, onReady, onDone, onError, onEnd } from '@ez4/local-common';
import { getRandomUUID, pickObject } from '@ez4/utils';
import { resolveValidation } from '@ez4/gateway/utils';
import { Runtime } from '@ez4/common';

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

  const servicesInUse = handler.references ? pickObject(services, handler.references) : services;
  const serviceClients = context.makeClients(servicesInUse);

  const traceId = getRandomUUID();

  Runtime.setScope({
    traceId
  });

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

  const currentRequest: Ws.Incoming<Ws.Event> = {
    connectionId: connection.id,
    requestId: getRandomUUID(),
    timestamp: new Date()
  };

  const onCustomValidation = (value: unknown, context: ValidationCustomContext) => {
    return resolveValidation(value, serviceClients, context.type);
  };

  try {
    await onBegin(module, serviceClients, currentRequest);

    if (handler.request) {
      const { preferences = defaults?.preferences } = target;

      const incoming = { ...event, preferences };

      Object.assign(currentRequest, await getIncomingRequestIdentity(handler.request, identity, onCustomValidation));
      Object.assign(currentRequest, await getIncomingRequestHeaders(handler.request, event, onCustomValidation));
      Object.assign(currentRequest, await getIncomingRequestQuery(handler.request, incoming, onCustomValidation));
    }

    await onReady(module, serviceClients, currentRequest);

    await module.handler(currentRequest, serviceClients);

    await onDone(module, serviceClients, currentRequest);

    //
  } catch (error) {
    await onError(module, serviceClients, currentRequest, error);

    throw error;
    //
  } finally {
    await onEnd(module, serviceClients, currentRequest);
  }
};
