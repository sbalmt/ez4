import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';
import type { EntryStates } from '@ez4/stateful';

import { linkServiceExtras } from '@ez4/project/library';
import { getFunctionState, tryGetFunctionState } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';

import { createTargetFunction } from '../schedule/function/service.js';
import { RoleMissingError } from './errors.js';
import { getTargetName } from './utils.js';

export const prepareTarget = (state: EntryStates, service: CronService, options: DeployOptions, context: EventContext) => {
  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  const { target } = service;

  const { handler, listener } = target;

  const currentFunctionState = tryGetFunctionState(context, handler.name, options);

  if (currentFunctionState) {
    return currentFunctionState;
  }

  const functionState = createTargetFunction(state, context.role, {
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

  context.setServiceState(functionState, handler.name, options);

  return functionState;
};

export const connectTarget = (state: EntryStates, service: CronService, options: DeployOptions, context: EventContext) => {
  if (!service.extras) {
    return;
  }

  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  const { handler } = service.target;

  const functionState = getFunctionState(context, handler.name, options);

  linkServiceExtras(state, functionState.entryId, service.extras);
};
