import type { EmulateServiceContext, EmulatorServiceRequest, ServeOptions } from '@ez4/project/library';
import type { HttpService } from '@ez4/gateway/library';
import type { RouteData } from '../utils/route';

import { getClientOperations } from '@ez4/gateway/library';
import { HttpForbiddenError, HttpNotFoundError } from '@ez4/gateway';
import { getServiceName } from '@ez4/project/library';

import { processHttpRequest } from '../handlers/request';
import { processHttpAuthorization } from '../handlers/authorizer';
import { createServiceClient } from '../client/service';
import { getErrorResponse } from '../utils/response';
import { getMatchingRoute } from '../utils/route';

export const registerLocalServices = (service: HttpService, options: ServeOptions, context: EmulateServiceContext) => {
  const { name: serviceName } = service;

  const httpRoutes = buildHttpRoutes(service);

  const clientOptions = {
    operations: getClientOperations(service),
    ...options
  };

  return {
    type: 'Gateway',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    exportHandler: () => {
      return createServiceClient(serviceName, clientOptions);
    },
    requestHandler: async (request: EmulatorServiceRequest) => {
      const methodRoutes = { ...httpRoutes.ANY, ...httpRoutes[request.method] };
      const currentRoute = getMatchingRoute(methodRoutes, request);

      if (!currentRoute) {
        return getErrorResponse(new HttpNotFoundError());
      }

      try {
        if (!currentRoute.authorizer) {
          return await processHttpRequest(service, options, context, currentRoute);
        }

        const identity = await processHttpAuthorization(service, options, context, currentRoute);

        if (identity) {
          return await processHttpRequest(service, options, context, currentRoute, identity);
        }

        return getErrorResponse(new HttpForbiddenError());
      } catch (error) {
        if (error instanceof Error) {
          return getErrorResponse(error);
        }

        throw error;
      }
    }
  };
};

const buildHttpRoutes = (service: HttpService) => {
  const httpRoutes: Record<string, Record<string, RouteData>> = {
    ANY: {}
  };

  const defaultPreferences = service.defaults?.preferences;

  for (const route of service.routes) {
    const [method, path] = route.path.split(' ', 2);

    if (!httpRoutes[method]) {
      httpRoutes[method] = {};
    }

    httpRoutes[method][path] = {
      httpErrors: route.httpErrors,
      preferences: route.preferences ?? defaultPreferences,
      variables: route.variables,
      authorizer: route.authorizer,
      listener: route.listener,
      handler: route.handler
    };
  }

  return httpRoutes;
};
