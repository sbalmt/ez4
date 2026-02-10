import type { HttpRoute, HttpService, WsConnection, WsService } from '@ez4/gateway/library';
import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryStates } from '@ez4/stateful';
import type { ObjectSchema } from '@ez4/schema';
import type { GatewayState } from '../gateway/types';

import { tryGetFunctionState } from '@ez4/aws-function';
import { isHttpService } from '@ez4/gateway/library';
import { isRoleState } from '@ez4/aws-identity';
import { createLogGroup } from '@ez4/aws-logs';
import { deepMerge } from '@ez4/utils';

import { Defaults } from '../utils/defaults';
import { getAuthorizer, createAuthorizer } from '../authorizer/service';
import { createAuthorizerFunction } from '../authorizer/function/service';
import { getFunctionName, getInternalName } from './utils/name';
import { RoleMissingError } from './errors';

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

  const defaults = deepMerge(service.defaults ?? {}, options.defaults ?? {});

  const {
    vpc,
    authorizer,
    listener = defaults.listener,
    runtime = defaults.runtime ?? Defaults.Runtime,
    architecture = defaults.architecture ?? Defaults.Architecture,
    logRetention = defaults.logRetention ?? Defaults.LogRetention,
    timeout = defaults.timeout ?? Defaults.Timeout,
    memory = defaults.memory ?? Defaults.Memory
  } = target;

  const internalName = getInternalName(service, authorizer.name);

  let authorizerState = tryGetFunctionState(context, internalName, options);

  const { provider, request } = authorizer;

  if (!authorizerState) {
    const authorizerName = getFunctionName(service, authorizer, options);
    const dependencies = context.getDependencyFiles(authorizer.file);

    const logGroupState = createLogGroup(state, {
      groupName: authorizerName,
      retention: logRetention,
      tags: options.tags
    });

    authorizerState = createAuthorizerFunction(state, context.role, logGroupState, {
      functionName: authorizerName,
      description: authorizer.description,
      headersSchema: request?.headers,
      parametersSchema: request?.parameters,
      querySchema: request?.query,
      timeout: Math.max(5, timeout - 1),
      services: provider?.services,
      context: service.context,
      release: options.release,
      debug: options.debug,
      tags: options.tags,
      variables: [options.variables, service.variables],
      architecture,
      runtime,
      memory,
      vpc,
      preferences: {
        ...service.defaults?.preferences,
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
      }
    });

    context.setServiceState(internalName, options, authorizerState);
  }

  const getPriorVariables = authorizerState.parameters.getFunctionVariables;

  authorizerState.parameters.getFunctionVariables = () => {
    return {
      ...getPriorVariables(),
      ...target.variables,
      ...provider?.variables
    };
  };

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

const getIdentitySources = (schema: ObjectSchema | undefined | null) => {
  if (schema) {
    return Object.keys(schema.properties);
  }

  return undefined;
};
