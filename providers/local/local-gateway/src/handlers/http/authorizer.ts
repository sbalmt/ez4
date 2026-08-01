import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { ValidationCustomContext } from '@ez4/validator';
import type { HttpService } from '@ez4/gateway/library';
import type { Http } from '@ez4/gateway';
import type { MatchingRoute } from '../../utils/route';

import { createModule, onBegin, onReady, onDone, onError, onEnd } from '@ez4/local-common';
import { resolveValidation } from '@ez4/gateway/utils';
import { getRandomUUID, pickObject } from '@ez4/utils';
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

  const servicesInUse = route.authorizer.references ? pickObject(services, route.authorizer.references) : services;
  const serviceClients = context.makeClients(servicesInUse);

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

  const currentRequest: Http.Incoming<Http.AuthRequest> = {
    requestId: getRandomUUID(),
    timestamp: new Date(),
    method: route.method,
    path: route.path,
    traceId
  };

  const onCustomValidation = (value: unknown, context: ValidationCustomContext) => {
    return resolveValidation(value, serviceClients, context.type);
  };

  try {
    await onBegin(module, serviceClients, currentRequest);

    if (route.authorizer?.request) {
      Object.assign(currentRequest, await getIncomingRequestHeaders(route.authorizer.request, route, onCustomValidation));
      Object.assign(currentRequest, await getIncomingRequestParameters(route.authorizer.request, route, onCustomValidation));
      Object.assign(currentRequest, await getIncomingRequestQuery(route.authorizer.request, route, onCustomValidation));
    }

    await onReady(module, serviceClients, currentRequest);

    const { identity } = await module.handler<Http.AuthResponse>(currentRequest, serviceClients);

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
