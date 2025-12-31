import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { BucketService } from '@ez4/storage/library';
import type { EntryStates } from '@ez4/stateful';

import { getFunctionState, tryGetFunctionState } from '@ez4/aws-function';
import { linkServiceContext } from '@ez4/project/library';
import { isRoleState } from '@ez4/aws-identity';
import { createLogGroup } from '@ez4/aws-logs';

import { createBucketEventFunction } from '../bucket/function/service';
import { getFunctionName, getInternalName } from './utils';
import { RoleMissingError } from './errors';
import { Defaults } from './defaults';

export const prepareEvents = (state: EntryStates, service: BucketService, options: DeployOptions, context: EventContext) => {
  if (!service.events) {
    return undefined;
  }

  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  const { defaults } = options;

  const {
    handler,
    listener,
    variables,
    runtime = defaults?.runtime ?? Defaults.Runtime,
    architecture = defaults?.architecture ?? Defaults.Architecture,
    logRetention = defaults?.logRetention ?? Defaults.LogRetention,
    memory = defaults?.memory ?? Defaults.Memory,
    timeout = Defaults.Timeout
  } = service.events;

  const internalName = getInternalName(service, handler.name);

  let handlerState = tryGetFunctionState(context, internalName, options);

  if (handlerState) {
    return handlerState;
  }

  const eventName = getFunctionName(service, handler.name, options);
  const dependencies = context.getDependencyFiles(handler.file);

  const logGroupState = createLogGroup(state, {
    retention: logRetention,
    groupName: eventName,
    tags: options.tags
  });

  handlerState = createBucketEventFunction(state, context.role, logGroupState, {
    functionName: eventName,
    description: handler.description,
    context: service.context,
    debug: options.debug,
    tags: options.tags,
    variables: [options.variables, service.variables, variables],
    architecture,
    runtime,
    timeout,
    memory,
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
    }
  });

  context.setServiceState(handlerState, internalName, options);

  return handlerState;
};

export const connectEvents = (state: EntryStates, service: BucketService, options: DeployOptions, context: EventContext) => {
  if (!service.events) {
    return;
  }

  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  const { handler } = service.events;

  const internalName = getInternalName(service, handler.name);
  const handlerState = getFunctionState(context, internalName, options);

  linkServiceContext(state, handlerState.entryId, service.context);
};
