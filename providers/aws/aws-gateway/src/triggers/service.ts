import type { ConnectResourceEvent, DeployOptions, EventContext, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';
import type { FunctionParameters, Variables } from '@ez4/aws-function';
import type { HttpRoute, HttpService } from '@ez4/gateway/library';
import type { EntryStates } from '@ez4/stateful';
import type { ObjectSchema } from '@ez4/schema';
import type { GatewayState } from '../gateway/types';

import { getServiceName, linkServiceContext } from '@ez4/project/library';
import { getFunctionState, tryGetFunctionState } from '@ez4/aws-function';
import { createLogGroup, createLogPolicy } from '@ez4/aws-logs';
import { isHttpService } from '@ez4/gateway/library';
import { isRoleState } from '@ez4/aws-identity';

import { createStage } from '../stage/service';
import { createRoute } from '../route/service';
import { createGateway } from '../gateway/service';
import { getAuthorizer, createAuthorizer } from '../authorizer/service';
import { createAuthorizerFunction } from '../authorizer/function/service';
import { createIntegrationFunction } from '../integration/function/service';
import { getIntegration, createIntegration } from '../integration/service';
import { getFunctionName, getInternalName } from './utils';
import { prepareLinkedClient } from './client';
import { getCorsConfiguration } from './cors';
import { RoleMissingError } from './errors';
import { Defaults } from './defaults';

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (isHttpService(service)) {
    return prepareLinkedClient(context, service, options);
  }

  return null;
};

export const prepareServices = (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isHttpService(service)) {
    return false;
  }

  const { name, displayName, description, routes, cors } = service;
  const { tags } = options;

  const gatewayState = createGateway(state, {
    cors: cors && getCorsConfiguration(routes, cors),
    gatewayId: getServiceName(service, options),
    gatewayName: displayName ?? name,
    description,
    tags
  });

  const logGroupState = createAccessLog(state, service, gatewayState, options);

  createStage(state, gatewayState, logGroupState, { autoDeploy: true });

  createRoutes(state, service, gatewayState, options, context);

  return true;
};

export const connectServices = (event: ConnectResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isHttpService(service)) {
    return;
  }

  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  for (const { disabled, authorizer, handler } of service.routes) {
    if (disabled) {
      continue;
    }

    const handlerName = getInternalName(service, handler.name);
    const handlerState = getFunctionState(context, handlerName, options);

    linkServiceContext(state, handlerState.entryId, service.context);

    if (authorizer) {
      const authorizerName = getInternalName(service, authorizer.name);
      const authorizerState = getFunctionState(context, authorizerName, options);

      linkServiceContext(state, authorizerState.entryId, service.context);
    }
  }
};

const createAccessLog = (state: EntryStates, service: HttpService, gatewayState: GatewayState, options: DeployOptions) => {
  const { access } = service;
  const { tags } = options;

  if (!access?.logRetention) {
    return undefined;
  }

  const logGroupState = createLogGroup(state, {
    groupName: getServiceName(service, options),
    retention: access.logRetention,
    tags
  });

  createLogPolicy(state, logGroupState, gatewayState, {
    fromService: getServiceName(service, options),
    policyGetter: () => {
      return {
        service: 'apigateway.amazonaws.com'
      };
    }
  });

  return logGroupState;
};

const createRoutes = (
  state: EntryStates,
  service: HttpService,
  gatewayState: GatewayState,
  options: DeployOptions,
  context: EventContext
) => {
  for (const route of service.routes) {
    if (route.disabled) {
      continue;
    }

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

  const defaults = service.defaults ?? {};

  const {
    handler,
    listener = defaults.listener,
    logRetention = defaults.logRetention,
    timeout = defaults.timeout,
    memory = defaults.memory
  } = route;

  const { provider, request, response } = handler;

  const internalName = getInternalName(service, handler.name);

  let handlerState = tryGetFunctionState(context, internalName, options);

  if (!handlerState) {
    const integrationName = getFunctionName(service, handler, options);
    const dependencies = context.getDependencyFiles(handler.file);

    const logGroupState = createLogGroup(state, {
      retention: logRetention ?? Defaults.LogRetention,
      groupName: integrationName,
      tags: options.tags
    });

    handlerState = createIntegrationFunction(state, context.role, logGroupState, {
      functionName: integrationName,
      description: handler.description,
      identitySchema: request?.identity,
      headersSchema: request?.headers,
      parametersSchema: request?.parameters,
      querySchema: request?.query,
      bodySchema: request?.body,
      responseSchema: response.body,
      timeout: Math.max(5, (timeout ?? Defaults.Timeout) - 1),
      memory: memory ?? Defaults.Memory,
      services: provider?.services,
      context: service.context,
      debug: options.debug,
      tags: options.tags,
      handler: {
        sourceFile: handler.file,
        functionName: handler.name,
        module: handler.module,
        dependencies
      },
      listener: listener && {
        functionName: listener.name,
        sourceFile: listener.file,
        module: listener.module
      },
      variables: {
        ...options.variables,
        ...service.variables
      },
      preferences: {
        ...defaults.preferences,
        ...route.preferences
      },
      errorsMap: {
        ...defaults.httpErrors,
        ...route.httpErrors
      }
    });

    context.setServiceState(handlerState, internalName, options);
  }

  if (route.variables) {
    assignVariables(handlerState.parameters, route.variables);
  }

  if (provider?.variables) {
    assignVariables(handlerState.parameters, provider.variables);
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

  const defaults = service.defaults ?? {};

  const {
    authorizer,
    listener = defaults.listener,
    logRetention = defaults.logRetention,
    timeout = defaults.timeout,
    memory = defaults.memory
  } = route;

  const internalName = getInternalName(service, authorizer.name);

  let authorizerState = tryGetFunctionState(context, internalName, options);

  const request = authorizer.request;

  if (!authorizerState) {
    const authorizerName = getFunctionName(service, authorizer, options);
    const dependencies = context.getDependencyFiles(authorizer.file);

    const logGroupState = createLogGroup(state, {
      retention: logRetention ?? Defaults.LogRetention,
      groupName: authorizerName,
      tags: options.tags
    });

    authorizerState = createAuthorizerFunction(state, context.role, logGroupState, {
      functionName: authorizerName,
      description: authorizer.description,
      headersSchema: request?.headers,
      parametersSchema: request?.parameters,
      querySchema: request?.query,
      timeout: Math.max(5, (timeout ?? Defaults.Timeout) - 1),
      memory: memory ?? Defaults.Memory,
      services: service.services,
      context: service.context,
      debug: options.debug,
      tags: options.tags,
      preferences: {
        ...defaults.preferences,
        ...route.preferences
      },
      authorizer: {
        sourceFile: authorizer.file,
        functionName: authorizer.name,
        module: authorizer.module,
        dependencies
      },
      listener: listener && {
        functionName: listener.name,
        sourceFile: listener.file,
        module: listener.module
      },
      variables: {
        ...options.variables,
        ...service.variables
      }
    });

    context.setServiceState(authorizerState, internalName, options);
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
