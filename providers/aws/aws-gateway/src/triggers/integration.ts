import type { HttpRoute, HttpService, WsService, WsConnection, WsMessage } from '@ez4/gateway/library';
import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { FunctionParameters, Variables } from '@ez4/aws-function';
import type { EntryStates } from '@ez4/stateful';
import type { GatewayState } from '../gateway/types';

import { isRoleState } from '@ez4/aws-identity';
import { tryGetFunctionState } from '@ez4/aws-function';
import { createLogGroup } from '@ez4/aws-logs';

import { IntegrationFunctionType } from '../integration/function/types';
import { createIntegrationFunction } from '../integration/function/service';
import { getIntegration, createIntegration } from '../integration/service';
import { getFunctionName, getInternalName } from './utils';
import { RoleMissingError } from './errors';
import { Defaults } from './defaults';
import { isAnyObject } from '@ez4/utils';

export const getIntegrationRequestFunction = (
  state: EntryStates,
  service: HttpService | WsService,
  gatewayState: GatewayState,
  target: HttpRoute,
  options: DeployOptions,
  context: EventContext
) => {
  return getIntegrationFunction(state, service, gatewayState, target, IntegrationFunctionType.HttpRequest, options, context);
};

export const getIntegrationConnectionFunction = (
  state: EntryStates,
  service: HttpService | WsService,
  gatewayState: GatewayState,
  target: WsConnection,
  options: DeployOptions,
  context: EventContext
) => {
  return getIntegrationFunction(state, service, gatewayState, target, IntegrationFunctionType.WsConnection, options, context);
};

export const getIntegrationMessageFunction = (
  state: EntryStates,
  service: HttpService | WsService,
  gatewayState: GatewayState,
  target: WsMessage,
  options: DeployOptions,
  context: EventContext
) => {
  return getIntegrationFunction(state, service, gatewayState, target, IntegrationFunctionType.WsMessage, options, context);
};

const getIntegrationFunction = (
  state: EntryStates,
  service: HttpService | WsService,
  gatewayState: GatewayState,
  target: HttpRoute | WsConnection | WsMessage,
  type: IntegrationFunctionType,
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
  } = target;

  const { provider, request, response } = handler as any;

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
      responseSchema: response?.body,
      timeout: Math.max(5, (timeout ?? Defaults.Timeout) - 1),
      memory: memory ?? Defaults.Memory,
      services: provider?.services,
      context: service.context,
      debug: options.debug,
      tags: options.tags,
      type,
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
        ...target.preferences
      },
      errorsMap: {
        ...('httpErrors' in defaults && isAnyObject(defaults.httpErrors) && defaults.httpErrors),
        ...('httpErrors' in target && isAnyObject(target.httpErrors) && target.httpErrors)
      }
    });

    context.setServiceState(handlerState, internalName, options);
  }

  if (target.variables) {
    assignVariables(handlerState.parameters, target.variables);
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

const assignVariables = (parameters: FunctionParameters, variables: Variables) => {
  parameters.variables = {
    ...parameters.variables,
    ...variables
  };
};
