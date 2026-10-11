import type { EmulateServiceContext, EmulatorRequestEvent, ServeOptions, ServiceEmulator } from '@ez4/project/library';
import type { HttpService } from '@ez4/gateway/library';
import type { RouteData } from '../../utils/route';

import { getClientOperations } from '@ez4/gateway/library';
import { HttpForbiddenError, HttpNotFoundError } from '@ez4/gateway';
import { getServiceName, triggerAllAsync } from '@ez4/project/library';

import { HttpManifest } from '../../service/manifest/http';
import { processHttpRequest } from '../../handlers/http/request';
import { processHttpAuthorization } from '../../handlers/http/authorizer';
import { getHttpErrorResponse } from '../../utils/http/response';
import { getMatchingRoute } from '../../utils/route';

export const registerHttpLocalService = (service: HttpService, options: ServeOptions, context: EmulateServiceContext): ServiceEmulator => {
  const { name: resourceName } = service;

  const httpRoutes = buildHttpRoutes(service);

  const identifier = getServiceName(resourceName, options);

  const clientOptions = {
    operations: getClientOperations(service),
    host: options.serviceHost,
    identifier
  };

  return {
    type: 'Gateway',
    name: resourceName,
    options: service.options,
    identifier,
    manifestHandler: () => {
      return HttpManifest.build(service);
    },
    exportDescriptor: () => {
      return {
        name: 'makeService',
        module: '@ez4/local-gateway/worker',
        options: {
          ...clientOptions,
          name: resourceName
        }
      };
    },
    requestHandler: async (request: EmulatorRequestEvent) => {
      const methodRoutes = { ...httpRoutes.ANY, ...httpRoutes[request.method] };
      const currentRoute = getMatchingRoute(methodRoutes, request);

      try {
        if (!currentRoute) {
          const fallback = await triggerAllAsync('emulator:fallbackRequest', (handler) => {
            return handler({ request, service, options });
          });

          if (!fallback) {
            throw new HttpNotFoundError();
          }

          return fallback;
        }

        if (!currentRoute.authorizer) {
          return await processHttpRequest(service, options, context, currentRoute);
        }

        const authorization = await processHttpAuthorization(service, options, context, currentRoute);

        if (authorization && 'status' in authorization) {
          return authorization;
        }

        const identity = authorization?.identity;

        if (identity) {
          return await processHttpRequest(service, options, context, currentRoute, identity);
        }

        return getHttpErrorResponse(new HttpForbiddenError());
        //
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        return getHttpErrorResponse(error);
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
      handler: route.handler,
      timeout: route.timeout,
      memory: route.memory
    };
  }

  return httpRoutes;
};
