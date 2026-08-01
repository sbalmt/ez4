import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { ValidationCustomContext } from '@ez4/validator';
import type { HttpService } from '@ez4/gateway/library';
import type { Http } from '@ez4/gateway';
import type { MatchingRoute } from '../../utils/route';

import { createModule, onBegin, onReady, onDone, onError, onEnd } from '@ez4/local-common';
import { getRandomUUID, pickObject } from '@ez4/utils';
import { resolveValidation } from '@ez4/gateway/utils';
import { Runtime } from '@ez4/common';

import { getHttpSuccessResponse } from '../../utils/http/response';

import {
  getIncomingRequestIdentity,
  getIncomingRequestParameters,
  getIncomingRequestHeaders,
  getIncomingRequestQuery,
  getIncomingRequestBody
} from '../../utils/request';

export const processHttpRequest = async (
  service: HttpService,
  options: ServeOptions,
  context: EmulateServiceContext,
  route: MatchingRoute,
  identity?: Http.Identity
) => {
  const handler = route.handler;

  const provider = handler.provider;
  const services = provider?.services ?? {};

  const servicesInUse = route.handler.references ? pickObject(services, route.handler.references) : services;
  const serviceClients = context.makeClients(servicesInUse);

  const traceId = getRandomUUID();

  Runtime.setScope({
    traceId
  });

  const module = await createModule({
    listener: route.listener ?? service.defaults?.listener,
    version: options.version,
    handler,
    variables: {
      ...options.variables,
      ...service.variables,
      ...route.variables,
      ...provider?.variables
    }
  });

  const currentRequest: Http.Incoming<Http.Request> = {
    requestId: getRandomUUID(),
    timestamp: new Date(),
    method: route.method,
    path: route.path,
    encoded: false,
    traceId
  };

  const onCustomValidation = (value: unknown, context: ValidationCustomContext) => {
    return resolveValidation(value, serviceClients, context.type);
  };

  try {
    await onBegin(module, serviceClients, currentRequest);

    if (handler.request) {
      Object.assign(currentRequest, await getIncomingRequestIdentity(handler.request, identity, onCustomValidation));
      Object.assign(currentRequest, await getIncomingRequestHeaders(handler.request, route, onCustomValidation));
      Object.assign(currentRequest, await getIncomingRequestParameters(handler.request, route, onCustomValidation));
      Object.assign(currentRequest, await getIncomingRequestQuery(handler.request, route, onCustomValidation));
      Object.assign(currentRequest, await getIncomingRequestBody(handler.request, route, onCustomValidation));
      Object.assign(currentRequest, { data: route.body?.toString() });
    }

    await onReady(module, serviceClients, currentRequest);

    const response = await module.handler<Http.Response>(currentRequest, serviceClients);
    const preferences = route.preferences;

    await onDone(module, serviceClients, currentRequest);

    return getHttpSuccessResponse(route.handler.response, response, preferences);
    //
  } catch (error) {
    await onError(module, serviceClients, currentRequest, error);

    throw error;
    //
  } finally {
    await onEnd(module, serviceClients, currentRequest);
  }
};
