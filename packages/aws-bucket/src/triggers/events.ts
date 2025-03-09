import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { BucketService } from '@ez4/storage/library';
import type { EntryStates } from '@ez4/stateful';

import { linkServiceExtras } from '@ez4/project/library';
import { getFunctionState, tryGetFunctionState } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';

import { createBucketEventFunction } from '../bucket/function/service.js';
import { RoleMissingError } from './errors.js';
import { getFunctionName } from './utils.js';

export const prepareEvents = (state: EntryStates, service: BucketService, options: DeployOptions, context: EventContext) => {
  if (!service.events) {
    return undefined;
  }

  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  const { events } = service;

  const { handler, listener } = events;

  const currentFunctionState = tryGetFunctionState(context, handler.name, options);

  if (currentFunctionState) {
    return currentFunctionState;
  }

  const functionState = createBucketEventFunction(state, context.role, {
    functionName: getFunctionName(service, handler.name, options),
    description: handler.description,
    timeout: events.timeout ?? 30,
    memory: events.memory ?? 192,
    extras: service.extras,
    debug: options.debug,
    variables: {
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

  context.setServiceState(functionState, handler.name, options);

  return functionState;
};

export const connectEvents = (state: EntryStates, service: BucketService, options: DeployOptions, context: EventContext) => {
  if (!service.extras || !service.events) {
    return;
  }

  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  const { handler } = service.events;

  const functionState = getFunctionState(context, handler.name, options);

  linkServiceExtras(state, functionState.entryId, service.extras);
};
