import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';
import type { EntryStates } from '@ez4/stateful';

import { getFunctionState, tryGetFunctionState } from '@ez4/aws-function';
import { linkServiceContext } from '@ez4/project/library';
import { isRoleState } from '@ez4/aws-identity';
import { createLogGroup } from '@ez4/aws-logs';

import { createTargetFunction } from '../schedule/function/service';
import { getInternalName, getTargetName } from './utils';
import { RoleMissingError } from './errors';
import { Defaults } from './defaults';

export const prepareScheduleTarget = (state: EntryStates, service: CronService, options: DeployOptions, context: EventContext) => {
  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  const {
    handler,
    listener,
    variables,
    runtime = options.defaults?.runtime ?? Defaults.Runtime,
    architecture = options.defaults?.architecture ?? Defaults.Architecture,
    logRetention = options.defaults?.logRetention ?? Defaults.LogRetention,
    memory = options.defaults?.memory ?? Defaults.Memory,
    timeout = Defaults.Timeout
  } = service.target;

  const internalName = getInternalName(service, handler.name);

  let handlerState = tryGetFunctionState(context, internalName, options);

  if (handlerState) {
    return handlerState;
  }

  const targetName = getTargetName(service, handler.name, options);
  const dependencies = context.getDependencyFiles(handler.file);

  const logGroupState = createLogGroup(state, {
    retention: logRetention,
    groupName: targetName,
    tags: options.tags
  });

  handlerState = createTargetFunction(state, context.role, logGroupState, {
    functionName: targetName,
    description: handler.description,
    eventSchema: service.schema,
    context: service.context,
    release: options.release,
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

export const connectTarget = (state: EntryStates, service: CronService, options: DeployOptions, context: EventContext) => {
  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  const { handler } = service.target;

  const internalName = getInternalName(service, handler.name);
  const handlerState = getFunctionState(context, internalName, options);

  linkServiceContext(state, handlerState.entryId, service.context);
};
