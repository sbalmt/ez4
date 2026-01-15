import type { EmulateServiceContext, EmulatorMessageEvent, ServeOptions } from '@ez4/project/library';
import type { ValidationCustomContext } from '@ez4/validator';
import type { WsService } from '@ez4/gateway/library';
import type { Ws } from '@ez4/gateway';

import { createModule, onBegin, onReady, onDone, onError, onEnd } from '@ez4/local-common';
import { resolveValidation } from '@ez4/gateway/utils';
import { Runtime } from '@ez4/common/runtime';
import { getRandomUUID } from '@ez4/utils';

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

  const clients = await context.makeClients(services);
  const handler = message.handler;

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

  const traceId = getRandomUUID();

  const request: Ws.Incoming<Ws.Request> = {
    connectionId: event.connection.id,
    requestId: getRandomUUID(),
    timestamp: new Date(),
    traceId
  };

  const onCustomValidation = (value: unknown, context: ValidationCustomContext) => {
    return resolveValidation(value, clients, context.type);
  };

  Runtime.setScope({
    isLocal: true,
    traceId
  });

  try {
    const { preferences = defaults?.preferences } = message;

    await onBegin(module, clients, request);

    if (handler.request) {
      const incoming = { ...event, preferences };

      Object.assign(request, await getIncomingRequestIdentity(handler.request, identity, onCustomValidation));
      Object.assign(request, await getIncomingRequestBody(handler.request, incoming, onCustomValidation));
    }

    await onReady(module, clients, request);

    const response = await module.handler<Ws.Response | void>(request, clients);

    await onDone(module, clients, request);

    if (handler.response && response) {
      return getWsSuccessResponse(handler.response, response, preferences);
    }

    return undefined;
    //
  } catch (error) {
    await onError(module, clients, request, error);

    throw error;
    //
  } finally {
    await onEnd(module, clients, request);
  }
};
