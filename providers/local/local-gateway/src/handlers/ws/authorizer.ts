import type { EmulateServiceContext, EmulatorConnectionEvent, ServeOptions } from '@ez4/project/library';
import type { ValidationCustomContext } from '@ez4/validator';
import type { WsService } from '@ez4/gateway/library';
import type { Ws } from '@ez4/gateway';

import { createModule, onBegin, onReady, onDone, onError, onEnd } from '@ez4/local-common';
import { resolveValidation } from '@ez4/gateway/utils';
import { Runtime } from '@ez4/common/runtime';
import { getRandomUUID } from '@ez4/utils';

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

  const clients = await context.makeClients(services);

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

  const traceId = getRandomUUID();

  const request: Ws.Incoming<Ws.AuthRequest> = {
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
    await onBegin(module, clients, request);

    if (connect.authorizer?.request) {
      const { preferences = defaults?.preferences } = connect;

      const incoming = { ...event, preferences };

      Object.assign(request, await getIncomingRequestHeaders(connect.authorizer.request, event, onCustomValidation));
      Object.assign(request, await getIncomingRequestQuery(connect.authorizer.request, incoming, onCustomValidation));
    }

    await onReady(module, clients, request);

    const { identity } = await module.handler<Ws.AuthResponse>(request, clients);

    await onDone(module, clients, request);

    return identity;
    //
  } catch (error) {
    await onError(module, clients, request, error);

    throw error;
    //
  } finally {
    await onEnd(module, clients, request);
  }
};
