import type { EmulateServiceContext, EmulatorMessageEvent, ServeOptions } from '@ez4/project/library';
import type { ValidationCustomContext } from '@ez4/validator';
import type { WsService } from '@ez4/gateway/library';
import type { Ws } from '@ez4/gateway';

import { createModule, onBegin, onReady, onDone, onError, onEnd } from '@ez4/local-common';
import { getRandomUUID, pickObject } from '@ez4/utils';
import { resolveValidation } from '@ez4/gateway/utils';
import { Runtime } from '@ez4/common';

import { getIncomingRequestIdentity, getIncomingRequestBody } from '../../utils/request';
import { getWsSuccessResponse } from '../../utils/ws/response';

export const processWsMessage = async (
  service: WsService,
  options: ServeOptions,
  context: EmulateServiceContext,
  event: EmulatorMessageEvent,
  identity?: Ws.Identity
) => {
  const { message, defaults, services } = service;

  const handler = message.handler;

  const servicesInUse = handler.references ? pickObject(services, handler.references) : services;
  const serviceClients = context.makeClients(servicesInUse);

  const traceId = getRandomUUID();

  Runtime.setScope({
    traceId
  });

  const module = await createModule({
    listener: service.message.listener ?? service.defaults?.listener,
    version: options.version,
    handler,
    variables: {
      ...options.variables,
      ...service.variables,
      ...message.variables
    }
  });

  const currentRequest: Ws.Incoming<Ws.Request> = {
    connectionId: event.connection.id,
    requestId: getRandomUUID(),
    timestamp: new Date(),
    traceId
  };

  const onCustomValidation = (value: unknown, context: ValidationCustomContext) => {
    return resolveValidation(value, serviceClients, context.type);
  };

  try {
    const { preferences = defaults?.preferences } = message;

    await onBegin(module, serviceClients, currentRequest);

    if (handler.request) {
      const incoming = { ...event, preferences };

      Object.assign(currentRequest, await getIncomingRequestIdentity(handler.request, identity, onCustomValidation));
      Object.assign(currentRequest, await getIncomingRequestBody(handler.request, incoming, onCustomValidation));
    }

    await onReady(module, serviceClients, currentRequest);

    const response = await module.handler<Ws.Response | void>(currentRequest, serviceClients);

    await onDone(module, serviceClients, currentRequest);

    if (handler.response && response) {
      return getWsSuccessResponse(handler.response, response, preferences);
    }

    return undefined;
    //
  } catch (error) {
    await onError(module, serviceClients, currentRequest, error);

    throw error;
    //
  } finally {
    await onEnd(module, serviceClients, currentRequest);
  }
};
