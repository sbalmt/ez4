import type { ObjectSchema } from '@ez4/schema';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { DeployOptions, ServiceResourceEvent } from '@ez4/project/library';
import type { HttpRoute, HttpService } from '@ez4/gateway/library';
import type { GatewayState } from '../gateway/types.js';

import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { isRole, registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerGatewayTriggers } from '@ez4/gateway/library';

import {
  FunctionParameters,
  registerTriggers as registerAwsFunctionTriggers,
  Variables
} from '@ez4/aws-function';

import { createTrigger } from '@ez4/project/library';
import { isHttpService } from '@ez4/gateway/library';
import { getFunction } from '@ez4/aws-function';

import { getIntegration, createIntegration } from '../integration/service.js';
import { getAuthorizer, createAuthorizer } from '../authorizer/service.js';
import { createIntegrationFunction } from '../integration/function/service.js';
import { createAuthorizerFunction } from '../authorizer/function/service.js';
import { createGateway } from '../gateway/service.js';
import { createStage } from '../stage/service.js';
import { createRoute } from '../route/service.js';
import { getFunctionName } from './utils.js';

let isRegistered = false;

/**
 * Register all triggers.
 */
export const registerTriggers = () => {
  if (!isRegistered) {
    registerAwsTriggers();
    registerAwsIdentityTriggers();
    registerAwsFunctionTriggers();
    registerGatewayTriggers();

    createTrigger('@ez4/aws-gateway', {
      'deploy:prepareResources': prepareHttpServices
    });

    isRegistered = true;
  }

  return isRegistered;
};

const prepareHttpServices = async (event: ServiceResourceEvent) => {
  const { state, service, options, role } = event;

  if (!isHttpService(service)) {
    return;
  }

  const gatewayState = createGateway(state, {
    gatewayId: service.name,
    gatewayName: service.displayName ?? service.name,
    description: service.description
  });

  createStage(state, gatewayState, {
    autoDeploy: true
  });

  await createHttpRoutes(state, service, role, gatewayState, options);
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
  execRole: EntryState | null,
  gatewayState: GatewayState,
  route: HttpRoute,
  options: DeployOptions
) => {
  if (!execRole || !isRole(execRole)) {
    throw new Error(`Execution role for API Gateway integration is missing.`);
  }

  const handler = route.handler;
  const request = handler.request;

  const functionName = getFunctionName(service, handler, options.resourcePrefix);
  const routeTimeout = route.timeout ?? 30;

  const functionState =
    getFunction(state, execRole, functionName) ??
    (await createIntegrationFunction(state, execRole, {
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
    }));

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
  execRole: EntryState | null,
  gatewayState: GatewayState,
  route: HttpRoute,
  options: DeployOptions
) => {
  if (!route.authorizer) {
    return undefined;
  }

  if (!execRole || !isRole(execRole)) {
    throw new Error(`Execution role for API Gateway authorizer is missing.`);
  }

  const authorizer = route.authorizer;
  const request = authorizer.request;

  const functionName = getFunctionName(service, authorizer, options.resourcePrefix);
  const routeTimeout = route.timeout ?? 30;

  const functionState =
    getFunction(state, execRole, functionName) ??
    (await createAuthorizerFunction(state, execRole, {
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
    }));

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
