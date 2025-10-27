import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { HttpService } from '@ez4/gateway/library';
import type { Http } from '@ez4/gateway';
import type { MatchingRoute } from '../utils/route';

import { createModule, onBegin, onEnd, onError, onReady } from '@ez4/local-common';
import { getRandomUUID } from '@ez4/utils';

import { getErrorResponse, getSuccessResponse } from '../utils/response';

import {
  getIncomingRequestIdentity,
  getIncomingRequestParameters,
  getIncomingRequestHeaders,
  getIncomingRequestQuery,
  getIncomingRequestBody
} from '../utils/request';

export const processHttpRequest = async (
  service: HttpService,
  options: ServeOptions,
  context: EmulateServiceContext,
  route: MatchingRoute,
  identity?: Http.Identity
) => {
  const module = await createModule({
    listener: route.listener ?? service.defaults?.listener,
    handler: route.handler,
    version: options.version,
    variables: {
      ...options.variables,
      ...service.variables,
      ...route.variables
    }
  });

  const services = route.handler.provider?.services;
  const clients = services && context.makeClients(services);

  const lambdaRequest: Http.Incoming<Http.Request> = {
    requestId: getRandomUUID(),
    timestamp: new Date(),
    method: route.method,
    path: route.path,
    encoded: false
  };

  try {
    await onBegin(module, clients, lambdaRequest);

    if (route.handler.request) {
      Object.assign(lambdaRequest, await getIncomingRequestIdentity(route.handler.request, identity));
      Object.assign(lambdaRequest, await getIncomingRequestHeaders(route.handler.request, route));
      Object.assign(lambdaRequest, await getIncomingRequestParameters(route.handler.request, route));
      Object.assign(lambdaRequest, await getIncomingRequestQuery(route.handler.request, route));
      Object.assign(lambdaRequest, await getIncomingRequestBody(route.handler.request, route));
    }

    await onReady(module, clients, lambdaRequest);

    const response = await module.handler<Http.Response>(lambdaRequest, clients);
    const preferences = route.preferences;

    return getSuccessResponse(route.handler.response, response, preferences);
    //
  } catch (error) {
    await onError(module, clients, lambdaRequest, error);

    if (!(error instanceof Error)) {
      return getErrorResponse();
    }

    return getErrorResponse(error, {
      ...service.defaults?.httpErrors,
      ...route.httpErrors
    });
    //
  } finally {
    await onEnd(module, clients, lambdaRequest);
  }
};
