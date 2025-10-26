import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { HttpService } from '@ez4/gateway/library';
import type { Http } from '@ez4/gateway';
import type { MatchingRoute } from '../utils/route';

import { createModule, onBegin, onEnd, onError, onReady } from '@ez4/local-common';
import { getRandomUUID } from '@ez4/utils';

import { getIncomingRequestHeaders, getIncomingRequestParameters, getIncomingRequestQuery } from '../utils/request';

export const processHttpAuthorization = async (
  service: HttpService,
  options: ServeOptions,
  context: EmulateServiceContext,
  route: MatchingRoute
): Promise<Http.Identity | undefined> => {
  if (!route.authorizer) {
    return undefined;
  }

  const module = await createModule({
    listener: route.listener ?? service.defaults?.listener,
    handler: route.authorizer,
    version: options.version,
    variables: {
      ...options.variables,
      ...service.variables,
      ...route.variables
    }
  });

  const services = route.handler.provider?.services;
  const clients = services && context.makeClients(services);

  const request: Http.Incoming<Http.AuthRequest> = {
    requestId: getRandomUUID(),
    timestamp: new Date(),
    method: route.method,
    path: route.path
  };

  try {
    await onBegin(module, clients, request);

    if (route.authorizer?.request) {
      Object.assign(request, await getIncomingRequestHeaders(route.authorizer.request, route));
      Object.assign(request, await getIncomingRequestParameters(route.authorizer.request, route));
      Object.assign(request, await getIncomingRequestQuery(route.authorizer.request, route));
    }

    await onReady(module, clients, request);

    const { identity } = await module.handler<Http.AuthResponse>(request, clients);

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
