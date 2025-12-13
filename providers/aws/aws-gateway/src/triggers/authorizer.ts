import type { HttpRoute, HttpService, WsConnection, WsService } from '@ez4/gateway/library';
import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { FunctionParameters, Variables } from '@ez4/aws-function';
import type { EntryStates } from '@ez4/stateful';
import type { ObjectSchema } from '@ez4/schema';
import type { GatewayState } from '../gateway/types';

import { createLogGroup } from '@ez4/aws-logs';
import { tryGetFunctionState } from '@ez4/aws-function';
import { isHttpService } from '@ez4/gateway/library';
import { isRoleState } from '@ez4/aws-identity';

import { getAuthorizer, createAuthorizer } from '../authorizer/service';
import { createAuthorizerFunction } from '../authorizer/function/service';
import { getFunctionName, getInternalName } from './utils';
import { RoleMissingError } from './errors';
import { Defaults } from './defaults';

export const getAuthorizerFunction = (
  state: EntryStates,
  service: HttpService | WsService,
  gatewayState: GatewayState,
  target: HttpRoute | WsConnection,
  options: DeployOptions,
  context: EventContext
) => {
  if (!target.authorizer) {
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
  } = target;

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
        ...target.preferences
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

  if (target.variables) {
    assignVariables(authorizerState.parameters, target.variables);
  }

  return (
    getAuthorizer(state, gatewayState, authorizerState) ??
    createAuthorizer(state, gatewayState, authorizerState, {
      name: authorizer.name,
      headerNames: getIdentitySources(request?.headers),
      queryNames: getIdentitySources(request?.query),
      ...(isHttpService(service) && {
        cacheTTL: service.cache?.authorizerTTL
      })
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
