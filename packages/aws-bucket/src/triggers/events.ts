import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { BucketService } from '@ez4/storage/library';
import type { EntryStates } from '@ez4/stateful';

import { getFunctionState, tryGetFunctionState } from '@ez4/aws-function';
import { linkServiceExtras } from '@ez4/project/library';
import { isRoleState } from '@ez4/aws-identity';
import { createLogGroup } from '@ez4/aws-logs';

import { createBucketEventFunction } from '../bucket/function/service.js';
import { getFunctionName, getInternalName } from './utils.js';
import { RoleMissingError } from './errors.js';
import { Defaults } from './defaults.js';

export const prepareEvents = (state: EntryStates, service: BucketService, options: DeployOptions, context: EventContext) => {
  if (!service.events) {
    return undefined;
  }

  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  const { handler, listener, retention, timeout, memory, variables } = service.events;

  const internalName = getInternalName(service, handler.name);

  let handlerState = tryGetFunctionState(context, internalName, options);

  if (handlerState) {
    return handlerState;
  }

  const eventName = getFunctionName(service, handler.name, options);

  const logGroupState = createLogGroup(state, {
    retention: retention ?? Defaults.LogRetention,
    groupName: eventName,
    tags: options.tags
  });

  handlerState = createBucketEventFunction(state, context.role, logGroupState, {
    functionName: eventName,
    description: handler.description,
    timeout: timeout ?? Defaults.Timeout,
    memory: memory ?? Defaults.Memory,
    extras: service.extras,
    debug: options.debug,
    tags: options.tags,
    variables: {
      ...options.variables,
      ...service.variables,
      ...variables
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

  context.setServiceState(handlerState, internalName, options);

  return handlerState;
};

export const connectEvents = (state: EntryStates, service: BucketService, options: DeployOptions, context: EventContext) => {
  if (!service.extras || !service.events) {
    return;
  }

  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  const { handler } = service.events;

  const internalName = getInternalName(service, handler.name);
  const handlerState = getFunctionState(context, internalName, options);

  linkServiceExtras(state, handlerState.entryId, service.extras);
};
