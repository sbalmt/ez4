import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';
import type { EntryStates } from '@ez4/state';

import { isLinkedContextVpcRequired, linkServiceContext } from '@ez4/project/library';
import { getFunctionState, tryGetFunctionState } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';
import { createLogGroup } from '@ez4/aws-logs';
import { arrayUnique } from '@ez4/utils';

import { createTargetFunction } from '../schedule/function/service';
import { getInternalName, getTargetName } from './utils';
import { RoleMissingError } from './errors';
import { Defaults } from './defaults';

export const prepareScheduleTarget = (state: EntryStates, service: CronService, options: DeployOptions, context: EventContext) => {
  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  const { defaults, release, tags } = options;

  const {
    runtime = defaults?.runtime ?? Defaults.Runtime,
    architecture = defaults?.architecture ?? Defaults.Architecture,
    logRetention = defaults?.logRetention ?? Defaults.LogRetention,
    logLevel = defaults?.logLevel ?? Defaults.LogLevel,
    memory = defaults?.memory ?? Defaults.Memory,
    timeout = Defaults.Timeout,
    debug = options.debug,
    variables,
    handler,
    middlewares = [],
    listener,
    files,
    vpc
  } = service.target;

  const internalName = getInternalName(service, handler.name);

  let handlerState = tryGetFunctionState(context, internalName, options);

  if (handlerState) {
    return handlerState;
  }

  const targetName = getTargetName(service, handler.name, options);

  const dependencies = arrayUnique([
    ...context.getDependencyFiles(handler.file),
    ...middlewares.flatMap(({ file }) => context.getDependencyFiles(file))
  ]);

  const logGroupState = createLogGroup(state, {
    retention: logRetention,
    groupName: targetName,
    tags
  });

  const references = handler.references
    ? arrayUnique(handler.references, ...middlewares.map(({ references }) => references), listener?.references)
    : undefined;

  handlerState = createTargetFunction(state, context.role, logGroupState, {
    functionName: targetName,
    description: handler.summary ?? handler.description,
    eventSchema: service.schema,
    variables: [options.variables, service.variables, variables],
    workspacePath: options.workspacePath,
    entrypointFile: options.bundle?.entrypointFile,
    projectPrefix: options.prefix,
    projectBranch: options.branchName,
    projectName: options.projectName,
    context: service.context,
    handler: {
      sourceFile: handler.file,
      functionName: handler.name,
      module: handler.module,
      dependencies
    },
    middlewares: middlewares.map((middleware) => ({
      functionName: middleware.name,
      sourceFile: middleware.file,
      module: middleware.module
    })),
    listener: listener && {
      functionName: listener.name,
      sourceFile: listener.file,
      module: listener.module
    },
    references,
    architecture,
    logLevel,
    runtime,
    release,
    timeout,
    memory,
    files,
    debug,
    tags,
    vpc
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
