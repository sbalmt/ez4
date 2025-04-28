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
import { createLogGroup } from '@ez4/aws-logs';

import { createRoute } from '../route/service.js';
import { createStage } from '../stage/service.js';
import { createGateway } from '../gateway/service.js';
import { createAuthorizerFunction } from '../authorizer/function/service.js';
import { getAuthorizer, createAuthorizer } from '../authorizer/service.js';
import { createIntegrationFunction } from '../integration/function/service.js';
import { getIntegration, createIntegration } from '../integration/service.js';
import { getFunctionName, getInternalName } from './utils.js';
import { getCorsConfiguration } from './cors.js';
import { RoleMissingError } from './errors.js';

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
    const handlerName = getInternalName(service, handler.name);
    const handlerState = getFunctionState(context, handlerName, options);

    linkServiceExtras(state, handlerState.entryId, service.extras);

    if (authorizer) {
      const authorizerName = getInternalName(service, authorizer.name);
      const authorizerState = getFunctionState(context, authorizerName, options);

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

  const handlerName = getInternalName(service, handler.name);

  let handlerState = tryGetFunctionState(context, handlerName, options);

  if (!handlerState) {
    const integrationName = getFunctionName(service, handler, options);
    const integrationDefaults = service.defaults ?? {};

    const integrationMemory = integrationDefaults.memory ?? 192;
    const integrationRetention = integrationDefaults.retention ?? 90;
    const integrationTimeout = integrationDefaults.timeout ?? 29;

    const logGroupState = createLogGroup(state, {
      groupName: integrationName,
      retention: integrationRetention
    });

    handlerState = createIntegrationFunction(state, context.role, logGroupState, {
      functionName: integrationName,
      description: handler.description,
      responseSchema: response.body,
      headersSchema: request?.headers,
      identitySchema: request?.identity,
      parametersSchema: request?.parameters,
      querySchema: request?.query,
      bodySchema: request?.body,
      timeout: integrationTimeout,
      memory: integrationMemory,
      extras: service.extras,
      debug: options.debug,
      variables: {
        ...options.variables,
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

    context.setServiceState(handlerState, handlerName, options);
  }

  if (route.variables) {
    assignVariables(handlerState.parameters, route.variables);
  }

  return (
    getIntegration(state, gatewayState, handlerState) ??
    createIntegration(state, gatewayState, handlerState, {
      fromService: handlerState.parameters.functionName,
      timeout: handlerState.parameters.timeout,
      description: handler.description
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

  const authorizerName = getInternalName(service, authorizer.name);

  let authorizerState = tryGetFunctionState(context, authorizerName, options);

  const request = authorizer.request;

  if (!authorizerState) {
    const authorizerName = getFunctionName(service, authorizer, options);
    const authorizerDefaults = service.defaults ?? {};

    const authorizerMemory = authorizerDefaults.memory ?? 192;
    const authorizerRetention = authorizerDefaults.retention ?? 90;
    const authorizerTimeout = authorizerDefaults.timeout ?? 29;

    const logGroupState = createLogGroup(state, {
      groupName: authorizerName,
      retention: authorizerRetention
    });

    authorizerState = createAuthorizerFunction(state, context.role, logGroupState, {
      functionName: authorizerName,
      description: authorizer.description,
      timeout: authorizerTimeout,
      memory: authorizerMemory,
      headersSchema: request?.headers,
      parametersSchema: request?.parameters,
      querySchema: request?.query,
      extras: service.extras,
      debug: options.debug,
      variables: {
        ...options.variables,
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

    context.setServiceState(authorizerState, authorizerName, options);
  }

  if (route.variables) {
    assignVariables(authorizerState.parameters, route.variables);
  }

  return (
    getAuthorizer(state, gatewayState, authorizerState) ??
    createAuthorizer(state, gatewayState, authorizerState, {
      name: authorizer.name,
      headerNames: getIdentitySources(request?.headers),
      queryNames: getIdentitySources(request?.query),
      cacheTTL: service.cache?.authorizerTTL
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
