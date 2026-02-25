import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';
import type { EntryStates } from '@ez4/stateful';

import { isLinkedContextVpcRequired, linkServiceContext } from '@ez4/project/library';
import { getFunctionState, tryGetFunctionState } from '@ez4/aws-function';
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

  const defaults = options.defaults;

  const {
    runtime = defaults?.runtime ?? Defaults.Runtime,
    architecture = defaults?.architecture ?? Defaults.Architecture,
    logRetention = defaults?.logRetention ?? Defaults.LogRetention,
    logLevel = defaults?.logLevel ?? Defaults.LogLevel,
    memory = defaults?.memory ?? Defaults.Memory,
    timeout = Defaults.Timeout,
    variables,
    listener,
    handler,
    vpc
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
    logLevel,
    runtime,
    timeout,
    memory,
    vpc,
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

  context.setServiceState(internalName, options, handlerState);

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

  if (!handlerState.parameters.vpc) {
    handlerState.parameters.vpc = isLinkedContextVpcRequired(service.context);
  }
};
