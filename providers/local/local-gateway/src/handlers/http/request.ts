import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { ValidationCustomContext } from '@ez4/validator';
import type { HttpService } from '@ez4/gateway/library';
import type { Http } from '@ez4/gateway';
import type { MatchingRoute } from '../../utils/route';

import { createModule, onBegin, onReady, onDone, onError, onEnd } from '@ez4/local-common';
import { resolveValidation } from '@ez4/gateway/utils';
import { getRandomUUID } from '@ez4/utils';

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

  const clients = await context.makeClients(services);

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

  const request: Http.Incoming<Http.Request> = {
    requestId: getRandomUUID(),
    timestamp: new Date(),
    method: route.method,
    path: route.path,
    encoded: false
  };

  const onCustomValidation = (value: unknown, context: ValidationCustomContext) => {
    return resolveValidation(value, clients, context.type);
  };

  try {
    await onBegin(module, clients, request);

    if (handler.request) {
      Object.assign(request, await getIncomingRequestIdentity(handler.request, identity, onCustomValidation));
      Object.assign(request, await getIncomingRequestHeaders(handler.request, route, onCustomValidation));
      Object.assign(request, await getIncomingRequestParameters(handler.request, route, onCustomValidation));
      Object.assign(request, await getIncomingRequestQuery(handler.request, route, onCustomValidation));
      Object.assign(request, await getIncomingRequestBody(handler.request, route, onCustomValidation));
      Object.assign(request, { data: route.body?.toString() });
    }

    await onReady(module, clients, request);

    const response = await module.handler<Http.Response>(request, clients);
    const preferences = route.preferences;

    await onDone(module, clients, request);

    return getHttpSuccessResponse(route.handler.response, response, preferences);
    //
  } catch (error) {
    await onError(module, clients, request, error);

    throw error;
    //
  } finally {
    await onEnd(module, clients, request);
  }
};
