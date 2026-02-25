import type { HttpRoute, HttpService, WsService, WsConnection, WsMessage } from '@ez4/gateway/library';
import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryStates } from '@ez4/stateful';
import type { GatewayState } from '../gateway/types';

import { tryGetFunctionState } from '@ez4/aws-function';
import { deepMerge, isAnyObject } from '@ez4/utils';
import { isRoleState } from '@ez4/aws-identity';
import { createLogGroup } from '@ez4/aws-logs';

import { Defaults } from '../utils/defaults';
import { IntegrationFunctionType } from '../integration/function/types';
import { createIntegrationFunction } from '../integration/function/service';
import { getIntegration, createIntegration } from '../integration/service';
import { getFunctionName, getInternalName } from './utils/name';
import { RoleMissingError } from './errors';

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

  const defaults = deepMerge(options.defaults ?? {}, service.defaults ?? {});

  const {
    runtime = defaults.runtime ?? Defaults.Runtime,
    architecture = defaults.architecture ?? Defaults.Architecture,
    logRetention = defaults.logRetention ?? Defaults.LogRetention,
    logLevel = defaults.logLevel ?? Defaults.LogLevel,
    timeout = defaults.timeout ?? Defaults.Timeout,
    memory = defaults.memory ?? Defaults.Memory,
    listener = defaults.listener,
    handler,
    vpc
  } = target;

  const provider = 'provider' in handler ? handler.provider : undefined;

  const { request, response } = handler;

  const internalName = getInternalName(service, handler.name);

  let handlerState = tryGetFunctionState(context, internalName, options);

  if (!handlerState) {
    const integrationName = getFunctionName(service, handler, options);
    const dependencies = context.getDependencyFiles(handler.file);

    const logGroupState = createLogGroup(state, {
      groupName: integrationName,
      retention: logRetention,
      tags: options.tags
    });

    handlerState = createIntegrationFunction(state, context.role, logGroupState, {
      functionName: integrationName,
      description: handler.description,
      ...(request && {
        ...('headers' in request && { headersSchema: request.headers }),
        ...('query' in request && { querySchema: request.query }),
        ...('identity' in request && { identitySchema: request.identity }),
        ...('parameters' in request && { parametersSchema: request.parameters }),
        bodySchema: request.body
      }),
      responseSchema: response?.body,
      timeout: Math.max(5, timeout - 1),
      services: provider?.services,
      context: service.context,
      release: options.release,
      debug: options.debug,
      tags: options.tags,
      variables: [options.variables, service.variables],
      architecture,
      logLevel,
      runtime,
      memory,
      type,
      vpc,
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
      preferences: {
        ...defaults.preferences,
        ...target.preferences
      },
      errorsMap: {
        ...('httpErrors' in defaults && isAnyObject(defaults.httpErrors) && defaults.httpErrors),
        ...('httpErrors' in target && isAnyObject(target.httpErrors) && target.httpErrors)
      }
    });

    context.setServiceState(internalName, options, handlerState);
  }

  const getPriorVariables = handlerState.parameters.getFunctionVariables;

  handlerState.parameters.getFunctionVariables = () => {
    return {
      ...getPriorVariables(),
      ...target.variables,
      ...provider?.variables
    };
  };

  return (
    getIntegration(state, gatewayState, handlerState) ??
    createIntegration(state, gatewayState, handlerState, {
      fromService: handlerState.parameters.functionName,
      timeout: handlerState.parameters.timeout,
      description: handler.description
    })
  );
};
