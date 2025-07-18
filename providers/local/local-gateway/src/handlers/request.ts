import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { HttpService } from '@ez4/gateway/library';
import type { Http } from '@ez4/gateway';
import type { MatchingRoute } from '../utils/route.js';

import { createModule, onBegin, onEnd, onError, onReady } from '@ez4/local-common';
import { Logger } from '@ez4/project/library';
import { getRandomUUID } from '@ez4/utils';

import { getOutgoingErrorResponse, getOutgoingSuccessResponse } from '../utils/response.js';

import {
  getIncomingRequestIdentity,
  getIncomingRequestParameters,
  getIncomingRequestHeaders,
  getIncomingRequestQuery,
  getIncomingRequestBody
} from '../utils/request.js';

export const processHttpRequest = async (
  service: HttpService,
  options: ServeOptions,
  context: EmulateServiceContext,
  route: MatchingRoute,
  identity?: Http.Identity
) => {
  const lambdaModule = await createModule({
    version: options.version,
    listener: route.listener,
    handler: route.handler,
    variables: {
      ...options.variables,
      ...service.variables,
      ...route.variables
    }
  });

  const lambdaContext = service.services && context.makeClients(service.services);

  const lambdaRequest: Http.Incoming<Http.Request> = {
    requestId: getRandomUUID(),
    timestamp: new Date(),
    method: route.method,
    path: route.path,
    encoded: false
  };

  try {
    await onBegin(lambdaModule, lambdaContext, lambdaRequest);

    if (route.handler.request) {
      Object.assign(lambdaRequest, await getIncomingRequestIdentity(route.handler.request, identity));
      Object.assign(lambdaRequest, await getIncomingRequestHeaders(route.handler.request, route.headers));
      Object.assign(lambdaRequest, await getIncomingRequestParameters(route.handler.request, route.parameters));
      Object.assign(lambdaRequest, await getIncomingRequestQuery(route.handler.request, route.query));
      Object.assign(lambdaRequest, await getIncomingRequestBody(route.handler.request, route.body));
    }

    await onReady(lambdaModule, lambdaContext, lambdaRequest);

    const { status, headers, body } = await lambdaModule.handler<Http.Response>(lambdaRequest, lambdaContext);

    return getOutgoingSuccessResponse(route.handler.response, status, headers, body);
    //
  } catch (error) {
    Logger.error(`${error}`);

    await onError(lambdaModule, lambdaContext, lambdaRequest, error);

    if (error instanceof Error) {
      return getOutgoingErrorResponse(error, route.httpErrors);
    }

    return getOutgoingErrorResponse();
    //
  } finally {
    await onEnd(lambdaModule, lambdaContext, lambdaRequest);
  }
};
