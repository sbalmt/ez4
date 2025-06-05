import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';
import type { EntryStates } from '@ez4/stateful';

import { getFunctionState, tryGetFunctionState } from '@ez4/aws-function';
import { linkServiceExtras } from '@ez4/project/library';
import { isRoleState } from '@ez4/aws-identity';
import { createLogGroup } from '@ez4/aws-logs';

import { createTargetFunction } from '../schedule/function/service.js';
import { getInternalName, getTargetName } from './utils.js';
import { RoleMissingError } from './errors.js';
import { Defaults } from './defaults.js';

export const prepareTarget = (state: EntryStates, service: CronService, options: DeployOptions, context: EventContext) => {
  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  const { handler, listener, retention, timeout, memory, variables } = service.target;

  const internalName = getInternalName(service, handler.name);

  let handlerState = tryGetFunctionState(context, internalName, options);

  if (handlerState) {
    return handlerState;
  }

  const targetName = getTargetName(service, handler.name, options);

  const logGroupState = createLogGroup(state, {
    retention: retention ?? Defaults.LogRetention,
    groupName: targetName,
    tags: options.tags,
  });

  handlerState = createTargetFunction(state, context.role, logGroupState, {
    functionName: targetName,
    description: handler.description,
    eventSchema: service.schema,
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
