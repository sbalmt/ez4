import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';
import type { EntryStates } from '@ez4/stateful';

import { linkServiceExtras } from '@ez4/project/library';
import { getFunctionState, tryGetFunctionState } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';

import { createTargetFunction } from '../schedule/function/service.js';
import { getInternalName, getTargetName } from './utils.js';
import { RoleMissingError } from './errors.js';

export const prepareTarget = (state: EntryStates, service: CronService, options: DeployOptions, context: EventContext) => {
  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  const { target } = service;

  const { handler, listener } = target;

  const internalName = getInternalName(service, handler.name);

  const currentHandlerState = tryGetFunctionState(context, internalName, options);

  if (currentHandlerState) {
    return currentHandlerState;
  }

  const handlerState = createTargetFunction(state, context.role, {
    functionName: getTargetName(service, handler.name, options),
    description: handler.description,
    eventSchema: service.schema,
    timeout: target.timeout ?? 10,
    memory: target.memory ?? 192,
    extras: service.extras,
    debug: options.debug,
    variables: {
      ...service.variables,
      ...target.variables
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

export const connectTarget = (state: EntryStates, service: CronService, options: DeployOptions, context: EventContext) => {
  if (!service.extras) {
    return;
  }

  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  const { handler } = service.target;

  const internalName = getInternalName(service, handler.name);
  const handlerState = getFunctionState(context, internalName, options);

  linkServiceExtras(state, handlerState.entryId, service.extras);
};
