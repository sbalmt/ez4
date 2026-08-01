import type { EmulateServiceContext, EmulatorConnectionEvent, ServeOptions } from '@ez4/project/library';
import type { ValidationCustomContext } from '@ez4/validator';
import type { WsService } from '@ez4/gateway/library';
import type { Ws } from '@ez4/gateway';

import { createModule, onBegin, onReady, onDone, onError, onEnd } from '@ez4/local-common';
import { getRandomUUID, pickObject } from '@ez4/utils';
import { resolveValidation } from '@ez4/gateway/utils';
import { Runtime } from '@ez4/common';

import { getIncomingRequestHeaders, getIncomingRequestQuery } from '../../utils/request';

export const processWsAuthorization = async (
  service: WsService,
  options: ServeOptions,
  context: EmulateServiceContext,
  event: EmulatorConnectionEvent
): Promise<Ws.Identity | undefined> => {
  const { connect, defaults } = service;

  if (!connect.authorizer) {
    return undefined;
  }

  const provider = connect.authorizer.provider;
  const services = provider?.services ?? {};

  const servicesInUse = connect.authorizer.references ? pickObject(services, connect.authorizer.references) : services;
  const serviceClients = context.makeClients(servicesInUse);

  const traceId = getRandomUUID();

  Runtime.setScope({
    traceId
  });

  const module = await createModule({
    listener: connect.listener ?? defaults?.listener,
    handler: connect.authorizer,
    version: options.version,
    variables: {
      ...options.variables,
      ...service.variables,
      ...connect.variables
    }
  });

  const currentRequest: Ws.Incoming<Ws.AuthRequest> = {
    connectionId: event.connection.id,
    requestId: getRandomUUID(),
    timestamp: new Date(),
    traceId
  };

  const onCustomValidation = (value: unknown, context: ValidationCustomContext) => {
    return resolveValidation(value, serviceClients, context.type);
  };

  try {
    await onBegin(module, serviceClients, currentRequest);

    if (connect.authorizer?.request) {
      const { preferences = defaults?.preferences } = connect;

      const incoming = { ...event, preferences };

      Object.assign(currentRequest, await getIncomingRequestHeaders(connect.authorizer.request, event, onCustomValidation));
      Object.assign(currentRequest, await getIncomingRequestQuery(connect.authorizer.request, incoming, onCustomValidation));
    }

    await onReady(module, serviceClients, currentRequest);

    const { identity } = await module.handler<Ws.AuthResponse>(currentRequest, serviceClients);

    await onDone(module, serviceClients, currentRequest);

    return identity;
    //
  } catch (error) {
    await onError(module, serviceClients, currentRequest, error);

    throw error;
    //
  } finally {
    await onEnd(module, serviceClients, currentRequest);
  }
};
