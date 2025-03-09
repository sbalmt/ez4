import type { ConnectResourceEvent, DeployOptions, EventContext, PrepareResourceEvent } from '@ez4/project/library';
import type { FunctionParameters, Variables } from '@ez4/aws-function';
import type { HttpRoute, HttpService } from '@ez4/gateway/library';
import type { EntryStates } from '@ez4/stateful';
import type { ObjectSchema } from '@ez4/schema';
import type { GatewayState } from '../gateway/types.js';

import { getServiceName, linkServiceExtras } from '@ez4/project/library';
import { getFunctionState, tryGetFunctionState } from '@ez4/aws-function';
import { isHttpService } from '@ez4/gateway/library';
import { isRoleState } from '@ez4/aws-identity';

import { createAuthorizerFunction } from '../authorizer/function/service.js';
import { createIntegrationFunction } from '../integration/function/service.js';
import { getIntegration, createIntegration } from '../integration/service.js';
import { getAuthorizer, createAuthorizer } from '../authorizer/service.js';
import { createGateway } from '../gateway/service.js';
import { createStage } from '../stage/service.js';
import { createRoute } from '../route/service.js';
import { getCorsConfiguration } from './cors.js';
import { RoleMissingError } from './errors.js';
import { getFunctionName } from './utils.js';

export const prepareHttpServices = (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isHttpService(service)) {
    return;
  }

  const { name, displayName, description, routes, cors } = service;

  const gatewayId = getServiceName(service, options);

  const gatewayState = createGateway(state, {
    gatewayName: displayName ?? name,
    gatewayId,
    description,
    ...(cors && {
      cors: getCorsConfiguration(routes, cors)
    })
  });

  createStage(state, gatewayState, {
    autoDeploy: true
  });

  createHttpRoutes(state, service, gatewayState, options, context);
};

export const connectHttpServices = (event: ConnectResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isHttpService(service) || !service.extras) {
    return;
  }

  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  for (const { authorizer, handler } of service.routes) {
    const handlerState = getFunctionState(context, handler.name, options);

    linkServiceExtras(state, handlerState.entryId, service.extras);

    if (authorizer) {
      const authorizerState = getFunctionState(context, authorizer.name, options);

      linkServiceExtras(state, authorizerState.entryId, service.extras);
    }
  }
};

const createHttpRoutes = (
  state: EntryStates,
  service: HttpService,
  gatewayState: GatewayState,
  options: DeployOptions,
  context: EventContext
) => {
  for (const route of service.routes) {
    const integrationState = getIntegrationFunction(state, service, gatewayState, route, options, context);

    const authorizerState = getAuthorizerFunction(state, service, gatewayState, route, options, context);

    createRoute(state, gatewayState, integrationState, authorizerState, {
      routePath: route.path
    });
  }
};

const getIntegrationFunction = (
  state: EntryStates,
  service: HttpService,
  gatewayState: GatewayState,
  route: HttpRoute,
  options: DeployOptions,
  context: EventContext
) => {
  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  const { handler, listener = service.defaults?.listener } = route;

  const { request, response } = handler;

  let functionState = tryGetFunctionState(context, handler.name, options);

  if (!functionState) {
    const routeTimeout = route.timeout ?? service.defaults?.timeout ?? 30;
    const routeMemory = route.memory ?? service.defaults?.memory ?? 192;

    functionState = createIntegrationFunction(state, context.role, {
      functionName: getFunctionName(service, handler, options),
      description: handler.description,
      responseSchema: response.body,
      headersSchema: request?.headers,
      identitySchema: request?.identity,
      parametersSchema: request?.parameters,
      querySchema: request?.query,
      bodySchema: request?.body,
      timeout: routeTimeout,
      memory: routeMemory,
      extras: service.extras,
      debug: options.debug,
      variables: {
        ...service.variables
      },
      handler: {
        functionName: handler.name,
        sourceFile: handler.file
      },
      ...(listener && {
        listener: {
          functionName: listener.name,
          sourceFile: listener.file
        }
      })
    });

    context.setServiceState(functionState, handler.name, options);
  }

  if (route.variables) {
    assignVariables(functionState.parameters, route.variables);
  }

  return (
    getIntegration(state, gatewayState, functionState) ??
    createIntegration(state, gatewayState, functionState, {
      description: handler.description,
      timeout: functionState.parameters.timeout
    })
  );
};

const getAuthorizerFunction = (
  state: EntryStates,
  service: HttpService,
  gatewayState: GatewayState,
  route: HttpRoute,
  options: DeployOptions,
  context: EventContext
) => {
  if (!route.authorizer) {
    return undefined;
  }

  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  const { authorizer, listener = service.defaults?.listener } = route;

  let functionState = tryGetFunctionState(context, authorizer.name, options);

  const request = authorizer.request;

  if (!functionState) {
    const routeTimeout = service.defaults?.timeout ?? 30;
    const routeMemory = service.defaults?.memory ?? 192;

    functionState = createAuthorizerFunction(state, context.role, {
      functionName: getFunctionName(service, authorizer, options),
      description: authorizer.description,
      timeout: routeTimeout,
      memory: routeMemory,
      headersSchema: request?.headers,
      parametersSchema: request?.parameters,
      querySchema: request?.query,
      extras: service.extras,
      debug: options.debug,
      variables: {
        ...service.variables
      },
      authorizer: {
        functionName: authorizer.name,
        sourceFile: authorizer.file
      },
      ...(listener && {
        listener: {
          functionName: listener.name,
          sourceFile: listener.file
        }
      })
    });

    context.setServiceState(functionState, authorizer.name, options);
  }

  if (route.variables) {
    assignVariables(functionState.parameters, route.variables);
  }

  return (
    getAuthorizer(state, gatewayState, functionState) ??
    createAuthorizer(state, gatewayState, functionState, {
      name: authorizer.name,
      headerNames: getIdentitySources(request?.headers),
      queryNames: getIdentitySources(request?.query)
    })
  );
};

const assignVariables = (parameters: FunctionParameters, variables: Variables) => {
  parameters.variables = {
    ...parameters.variables,
    ...variables
  };
};

const getIdentitySources = (schema: ObjectSchema | undefined | null) => {
  if (schema) {
    return Object.keys(schema.properties);
  }

  return undefined;
};
