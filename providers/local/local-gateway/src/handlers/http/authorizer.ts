import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { ValidationCustomContext } from '@ez4/validator';
import type { HttpService } from '@ez4/gateway/library';
import type { Http } from '@ez4/gateway';
import type { MatchingRoute } from '../../utils/route';

import { createModule, onBegin, onReady, onDone, onError, onEnd } from '@ez4/local-common';
import { resolveValidation } from '@ez4/gateway/utils';
import { getRandomUUID } from '@ez4/utils';
import { Runtime } from '@ez4/common';

import { getIncomingRequestHeaders, getIncomingRequestParameters, getIncomingRequestQuery } from '../../utils/request';

export const processHttpAuthorization = async (
  service: HttpService,
  options: ServeOptions,
  context: EmulateServiceContext,
  route: MatchingRoute
): Promise<Http.Identity | undefined> => {
  if (!route.authorizer) {
    return undefined;
  }

  const provider = route.authorizer.provider;
  const services = provider?.services ?? {};

  const clients = await context.makeClients(services);
  const traceId = getRandomUUID();

  Runtime.setScope({
    traceId
  });

  const module = await createModule({
    listener: route.listener ?? service.defaults?.listener,
    handler: route.authorizer,
    version: options.version,
    variables: {
      ...options.variables,
      ...service.variables,
      ...route.variables,
      ...provider?.variables
    }
  });

  const request: Http.Incoming<Http.AuthRequest> = {
    requestId: getRandomUUID(),
    timestamp: new Date(),
    method: route.method,
    path: route.path,
    traceId
  };

  const onCustomValidation = (value: unknown, context: ValidationCustomContext) => {
    return resolveValidation(value, clients, context.type);
  };

  try {
    await onBegin(module, clients, request);

    if (route.authorizer?.request) {
      Object.assign(request, await getIncomingRequestHeaders(route.authorizer.request, route, onCustomValidation));
      Object.assign(request, await getIncomingRequestParameters(route.authorizer.request, route, onCustomValidation));
      Object.assign(request, await getIncomingRequestQuery(route.authorizer.request, route, onCustomValidation));
    }

    await onReady(module, clients, request);

    const { identity } = await module.handler<Http.AuthResponse>(request, clients);

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
