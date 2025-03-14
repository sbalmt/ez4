import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { BucketService } from '@ez4/storage/library';
import type { EntryStates } from '@ez4/stateful';

import { linkServiceExtras } from '@ez4/project/library';
import { getFunctionState, tryGetFunctionState } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';

import { createBucketEventFunction } from '../bucket/function/service.js';
import { getFunctionName, getInternalName } from './utils.js';
import { RoleMissingError } from './errors.js';

export const prepareEvents = (state: EntryStates, service: BucketService, options: DeployOptions, context: EventContext) => {
  if (!service.events) {
    return undefined;
  }

  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  const { events } = service;

  const { handler, listener } = events;

  const internalName = getInternalName(service, handler.name);

  const currentHandlerState = tryGetFunctionState(context, internalName, options);

  if (currentHandlerState) {
    return currentHandlerState;
  }

  const handlerState = createBucketEventFunction(state, context.role, {
    functionName: getFunctionName(service, handler.name, options),
    description: handler.description,
    timeout: events.timeout ?? 30,
    memory: events.memory ?? 192,
    extras: service.extras,
    debug: options.debug,
    variables: {
      ...options.variables,
      ...service.variables,
      ...events.variables
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
