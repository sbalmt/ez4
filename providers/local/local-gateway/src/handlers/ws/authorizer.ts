import type { EmulateServiceContext, EmulatorConnectionEvent, ServeOptions } from '@ez4/project/library';
import type { WsService } from '@ez4/gateway/library';
import type { Ws } from '@ez4/gateway';

import { createModule, onBegin, onReady, onDone, onError, onEnd } from '@ez4/local-common';
import { getRandomUUID } from '@ez4/utils';

import { getIncomingRequestHeaders, getIncomingRequestQuery } from '../../utils/request';

export const processWsAuthorization = async (
  service: WsService,
  options: ServeOptions,
  context: EmulateServiceContext,
  event: EmulatorConnectionEvent
): Promise<Ws.Identity | undefined> => {
  const { connect } = service;

  if (!connect.authorizer) {
    return undefined;
  }

  const { services } = service;

  const clients = services && (await context.makeClients(services));

  const module = await createModule({
    listener: connect.listener ?? service.defaults?.listener,
    handler: connect.authorizer,
    version: options.version,
    variables: {
      ...options.variables,
      ...service.variables,
      ...connect.variables
    }
  });

  const request: Ws.Incoming<Ws.AuthRequest> = {
    connectionId: event.connection.id,
    requestId: getRandomUUID(),
    timestamp: new Date()
  };

  try {
    await onBegin(module, clients, request);

    if (connect.authorizer?.request) {
      Object.assign(request, await getIncomingRequestHeaders(connect.authorizer.request, event));
      Object.assign(request, await getIncomingRequestQuery(connect.authorizer.request, event));
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
