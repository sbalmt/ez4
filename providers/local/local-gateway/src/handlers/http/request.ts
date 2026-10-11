import type { EmulateServiceContext, EmulatorResponse, ServeOptions } from '@ez4/project/library';
import type { HttpService } from '@ez4/gateway/library';
import type { Http } from '@ez4/gateway';
import type { MatchingRoute } from '../../utils/route';

import { RequestType } from '../../worker/invoker';
import { invokeGatewayModule } from '../module';

export const processHttpRequest = async (
  service: HttpService,
  options: ServeOptions,
  context: EmulateServiceContext,
  route: MatchingRoute,
  identity?: Http.Identity
) => {
  const { handler, preferences } = route;
  const { provider } = handler;

  return invokeGatewayModule<EmulatorResponse>(
    options,
    context,
    {
      handler,
      listener: route.listener ?? service.defaults?.listener,
      services: provider?.services,
      timeout: route.timeout ?? service.defaults?.timeout,
      memory: route.memory ?? service.defaults?.memory,
      variables: {
        ...service.variables,
        ...route.variables,
        ...provider?.variables
      },
      invoker: {
        type: RequestType.HttpRequest,
        request: handler.request,
        response: handler.response,
        preferences,
        httpErrors: {
          ...service.defaults?.httpErrors,
          ...route.httpErrors
        }
      }
    },
    {
      method: route.method,
      path: route.path,
      headers: route.headers,
      parameters: route.parameters,
      query: route.query,
      body: route.body?.toString(),
      identity
    }
  );
};
