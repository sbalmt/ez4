import type { EmulateServiceContext, EmulatorServiceRequest, ServeOptions } from '@ez4/project/library';
import type { HttpService } from '@ez4/gateway/library';
import type { RouteData } from '../utils/route.js';

import { HttpForbiddenError, HttpNotFoundError } from '@ez4/gateway';
import { getServiceName } from '@ez4/project/library';

import { processHttpRequest } from '../handlers/request.js';
import { processHttpAuthorization } from '../handlers/authorizer.js';
import { getOutgoingErrorResponse } from '../utils/response.js';
import { getMatchingRoute } from '../utils/route.js';

export const registerHttpServices = (service: HttpService, options: ServeOptions, context: EmulateServiceContext) => {
  const httpRoutes = buildHttpRoutes(service);

  return {
    type: 'Gateway',
    name: service.name,
    identifier: getServiceName(service.name, options),
    requestHandler: async (request: EmulatorServiceRequest) => {
      const methodRoutes = { ...httpRoutes.ANY, ...httpRoutes[request.method] };
      const currentRoute = getMatchingRoute(methodRoutes, request);

      if (!currentRoute) {
        return getOutgoingErrorResponse(new HttpNotFoundError());
      }

      if (!currentRoute.authorizer) {
        return processHttpRequest(service, options, context, currentRoute);
      }

      const identity = await processHttpAuthorization(service, options, context, currentRoute);

      if (identity) {
        return processHttpRequest(service, options, context, currentRoute, identity);
      }

      return getOutgoingErrorResponse(new HttpForbiddenError());
    }
  };
};

const buildHttpRoutes = (service: HttpService) => {
  const httpRoutes: Record<string, Record<string, RouteData>> = {
    ANY: {}
  };

  for (const route of service.routes) {
    const [method, path] = route.path.split(' ', 2);

    if (!httpRoutes[method]) {
      httpRoutes[method] = {};
    }

    httpRoutes[method][path] = {
      httpErrors: route.httpErrors,
      authorizer: route.authorizer,
      variables: route.variables,
      listener: route.listener,
      handler: route.handler
    };
  }

  return httpRoutes;
};
