import type { DatabaseService, DatabaseTable } from '@ez4/database/library';
import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryStates } from '@ez4/state';
import type { TableState } from '../table/types';

import { tryGetFunctionState } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';
import { createLogGroup } from '@ez4/aws-logs';
import { arrayUnique } from '@ez4/utils';

import { createMapping } from '../mapping/service';
import { createStreamFunction } from '../mapping/function/service';
import { getInternalName, getStreamName } from './utils';
import { RoleMissingError } from './errors';
import { Defaults } from './defaults';

export const prepareTableStream = (
  state: EntryStates,
  service: DatabaseService,
  table: DatabaseTable,
  tableState: TableState,
  options: DeployOptions,
  context: EventContext
) => {
  if (!table.stream) {
    return;
  }

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
    triggers,
    handler,
    middlewares = [],
    listener,
    files,
    vpc
  } = table.stream;

  const internalName = getInternalName(service, table, handler.name);

  let handlerState = tryGetFunctionState(context, internalName, options);

  if (!handlerState) {
    const streamName = getStreamName(service, table, handler.name, options);

    const dependencies = arrayUnique([
      ...context.getDependencyFiles(handler.file),
      ...middlewares.flatMap(({ file }) => context.getDependencyFiles(file))
    ]);

    const logGroupState = createLogGroup(state, {
      dependencies: [tableState.entryId],
      retention: logRetention,
      groupName: streamName,
      tags
    });

    const references = handler.references
      ? arrayUnique(handler.references, ...middlewares.map(({ references }) => references), listener?.references)
      : undefined;

    handlerState = createStreamFunction(state, context.role, logGroupState, {
      functionName: streamName,
      tableSchema: table.schema,
      description: handler.summary ?? handler.description,
      variables: [options.variables, service.variables, variables],
      dependencies: [tableState.entryId],
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
  }

  createMapping(state, tableState, handlerState, {
    fromService: internalName,
    triggers
  });

  return handlerState;
};
