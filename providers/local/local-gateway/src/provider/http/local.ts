import type { EmulateServiceContext, EmulatorRequestEvent, ServeOptions } from '@ez4/project/library';
import type { HttpService } from '@ez4/gateway/library';
import type { RouteData } from '../../utils/route';

import { getClientOperations } from '@ez4/gateway/library';
import { HttpForbiddenError, HttpNotFoundError } from '@ez4/gateway';
import { getServiceName, triggerAllAsync } from '@ez4/project/library';

import { processHttpRequest } from '../../handlers/http/request';
import { processHttpAuthorization } from '../../handlers/http/authorizer';
import { createHttpServiceClient } from '../../client/http/service';
import { getHttpErrorResponse } from '../../utils/http/response';
import { getMatchingRoute } from '../../utils/route';

export const registerHttpLocalServices = (service: HttpService, options: ServeOptions, context: EmulateServiceContext) => {
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
      return createHttpServiceClient(serviceName, clientOptions);
    },
    requestHandler: async (request: EmulatorRequestEvent) => {
      const methodRoutes = { ...httpRoutes.ANY, ...httpRoutes[request.method] };
      const currentRoute = getMatchingRoute(methodRoutes, request);

      if (!currentRoute) {
        const fallback = await triggerAllAsync('emulator:fallbackRequest', (handler) =>
          handler({
            request,
            service
          })
        );

        if (fallback) {
          return fallback;
        }

        return getHttpErrorResponse(new HttpNotFoundError());
      }

      try {
        if (!currentRoute.authorizer) {
          return await processHttpRequest(service, options, context, currentRoute);
        }

        const identity = await processHttpAuthorization(service, options, context, currentRoute);

        if (identity) {
          return await processHttpRequest(service, options, context, currentRoute, identity);
        }

        return getHttpErrorResponse(new HttpForbiddenError());
      } catch (error) {
        if (error instanceof Error) {
          return getHttpErrorResponse(error);
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
