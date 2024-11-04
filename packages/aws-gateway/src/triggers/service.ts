import type { ObjectSchema } from '@ez4/schema';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { HttpRoute, HttpService } from '@ez4/gateway/library';
import type { GatewayState } from '../gateway/types.js';

import type {
  ConnectResourceEvent,
  DeployOptions,
  PrepareResourceEvent
} from '@ez4/project/library';

import { linkServiceExtras } from '@ez4/project/library';
import { FunctionParameters, Variables } from '@ez4/aws-function';
import { isHttpService } from '@ez4/gateway/library';
import { getFunction } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';

import { createAuthorizerFunction } from '../authorizer/function/service.js';
import { createIntegrationFunction } from '../integration/function/service.js';
import { getIntegration, createIntegration } from '../integration/service.js';
import { getAuthorizer, createAuthorizer } from '../authorizer/service.js';
import { createGateway } from '../gateway/service.js';
import { createStage } from '../stage/service.js';
import { createRoute } from '../route/service.js';
import { getCorsConfiguration } from './cors.js';
import { getFunctionName } from './utils.js';

export const prepareHttpServices = async (event: PrepareResourceEvent) => {
  const { state, service, options, role } = event;

  if (!isHttpService(service)) {
    return;
  }

  const { name, displayName, description, routes, cors } = service;

  const gatewayState = createGateway(state, {
    gatewayId: name,
    gatewayName: displayName ?? name,
    description,
    ...(cors && {
      cors: getCorsConfiguration(routes, cors)
    })
  });

  createStage(state, gatewayState, {
    autoDeploy: true
  });

  await createHttpRoutes(state, service, role, gatewayState, options);
};

export const connectHttpServices = (event: ConnectResourceEvent) => {
  const { state, service, role, options } = event;

  if (!isHttpService(service) || !service.extras) {
    return;
  }

  if (!role || !isRoleState(role)) {
    throw new Error(`Execution role for API Gateway is missing.`);
  }

  for (const { authorizer, handler } of service.routes) {
    const handlerFunctionName = getFunctionName(service, handler, options);
    const handlerFunctionState = getFunction(state, role, handlerFunctionName);

    if (handlerFunctionState) {
      linkServiceExtras(state, handlerFunctionState.entryId, service.extras);
    }

    if (authorizer) {
      const authorizerFunctionName = getFunctionName(service, authorizer, options);
      const authorizerFunctionState = getFunction(state, role, authorizerFunctionName);

      if (authorizerFunctionState) {
        linkServiceExtras(state, authorizerFunctionState.entryId, service.extras);
      }
    }
  }
};

const createHttpRoutes = async (
  state: EntryStates,
  service: HttpService,
  execRole: EntryState | null,
  gatewayState: GatewayState,
  options: DeployOptions
) => {
  for (const route of service.routes) {
    const integrationState = await getIntegrationFunction(
      state,
      service,
      execRole,
      gatewayState,
      route,
      options
    );

    const authorizerState = await getAuthorizerFunction(
      state,
      service,
      execRole,
      gatewayState,
      route,
      options
    );

    createRoute(state, gatewayState, integrationState, authorizerState, {
      routePath: route.path
    });
  }
};

const getIntegrationFunction = async (
  state: EntryStates,
  service: HttpService,
  role: EntryState | null,
  gatewayState: GatewayState,
  route: HttpRoute,
  options: DeployOptions
) => {
  if (!role || !isRoleState(role)) {
    throw new Error(`Execution role for API Gateway integration is missing.`);
  }

  const handler = route.handler;
  const request = handler.request;

  const functionName = getFunctionName(service, handler, options);
  const routeTimeout = route.timeout ?? 30;

  const functionState =
    getFunction(state, role, functionName) ??
    createIntegrationFunction(state, role, {
      functionName,
      description: handler.description,
      sourceFile: handler.file,
      handlerName: handler.name,
      timeout: routeTimeout,
      memory: route.memory,
      headersSchema: request?.headers,
      identitySchema: request?.identity,
      parametersSchema: request?.parameters,
      querySchema: request?.query,
      bodySchema: request?.body,
      extras: service.extras,
      variables: {
        ...service.variables
      }
    });

  if (route.variables) {
    assignVariables(functionState.parameters, route.variables);
  }

  return (
    getIntegration(state, gatewayState, functionState) ??
    createIntegration(state, gatewayState, functionState, {
      description: handler.description,
      timeout: routeTimeout
    })
  );
};

const getAuthorizerFunction = async (
  state: EntryStates,
  service: HttpService,
  role: EntryState | null,
  gatewayState: GatewayState,
  route: HttpRoute,
  options: DeployOptions
) => {
  if (!route.authorizer) {
    return undefined;
  }

  if (!role || !isRoleState(role)) {
    throw new Error(`Execution role for API Gateway authorizer is missing.`);
  }

  const authorizer = route.authorizer;
  const request = authorizer.request;

  const functionName = getFunctionName(service, authorizer, options);
  const routeTimeout = route.timeout ?? 30;

  const functionState =
    getFunction(state, role, functionName) ??
    createAuthorizerFunction(state, role, {
      functionName,
      description: authorizer.description,
      sourceFile: authorizer.file,
      handlerName: authorizer.name,
      timeout: routeTimeout,
      headersSchema: request?.headers,
      parametersSchema: request?.parameters,
      querySchema: request?.query,
      extras: service.extras,
      variables: {
        ...service.variables
      }
    });

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
