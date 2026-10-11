import type { EmulateServiceContext, EmulatorResponse, ServeOptions } from '@ez4/project/library';
import type { HttpService } from '@ez4/gateway/library';
import type { Http } from '@ez4/gateway';
import type { MatchingRoute } from '../../utils/route';

import { RequestType } from '../../worker/invoker';
import { invokeGatewayModule } from '../module';

export const processHttpAuthorization = async (
  service: HttpService,
  options: ServeOptions,
  context: EmulateServiceContext,
  route: MatchingRoute
): Promise<Http.AuthResponse | EmulatorResponse | undefined> => {
  const { authorizer } = route;

  if (!authorizer) {
    return undefined;
  }

  const { provider } = authorizer;

  return invokeGatewayModule<Http.AuthResponse | EmulatorResponse | undefined>(
    options,
    context,
    {
      handler: authorizer,
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
        type: RequestType.HttpAuthorizer,
        request: authorizer.request,
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
      query: route.query
    }
  );
};
