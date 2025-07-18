import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { HttpService } from '@ez4/gateway/library';
import type { Http } from '@ez4/gateway';
import type { MatchingRoute } from '../utils/route.js';

import { createModule, onBegin, onEnd, onError, onReady } from '@ez4/local-common';
import { getRandomUUID } from '@ez4/utils';

import { getIncomingRequestHeaders, getIncomingRequestParameters, getIncomingRequestQuery } from '../utils/request.js';

export const processHttpAuthorization = async (
  service: HttpService,
  options: ServeOptions,
  context: EmulateServiceContext,
  route: MatchingRoute
): Promise<Http.Identity | undefined> => {
  if (!route.authorizer) {
    return undefined;
  }

  const lambdaModule = await createModule({
    version: options.version,
    handler: route.authorizer,
    listener: route.listener,
    variables: {
      ...options.variables,
      ...service.variables,
      ...route.variables
    }
  });

  const lambdaContext = service.services && context.makeClients(service.services);

  const lambdaRequest: Http.Incoming<Http.AuthRequest> = {
    requestId: getRandomUUID(),
    timestamp: new Date(),
    method: route.method,
    path: route.path
  };

  try {
    await onBegin(lambdaModule, lambdaContext, lambdaRequest);

    if (route.authorizer?.request) {
      Object.assign(lambdaRequest, await getIncomingRequestHeaders(route.authorizer.request, route.headers));
      Object.assign(lambdaRequest, await getIncomingRequestParameters(route.authorizer.request, route.parameters));
      Object.assign(lambdaRequest, await getIncomingRequestQuery(route.authorizer.request, route.query));
    }

    await onReady(lambdaModule, lambdaContext, lambdaRequest);

    const { identity } = await lambdaModule.handler<Http.AuthResponse>(lambdaRequest, lambdaContext);

    return identity;
    //
  } catch (error) {
    await onError(lambdaModule, lambdaContext, lambdaRequest, error);

    return undefined;
    //
  } finally {
    await onEnd(lambdaModule, lambdaContext, lambdaRequest);
  }
};
