import type { DatabaseService, DatabaseTable } from '@ez4/database/library';
import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryStates } from '@ez4/stateful';
import type { TableState } from '../table/types';

import { tryGetFunctionState } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';
import { createLogGroup } from '@ez4/aws-logs';

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

  const { defaults, release } = options;

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
  } = table.stream;

  const internalName = getInternalName(service, table, handler.name);

  let handlerState = tryGetFunctionState(context, internalName, options);

  if (!handlerState) {
    const streamName = getStreamName(service, table, handler.name, options);
    const dependencies = context.getDependencyFiles(handler.file);

    const logGroupState = createLogGroup(state, {
      retention: logRetention,
      groupName: streamName,
      tags: options.tags
    });

    handlerState = createStreamFunction(state, context.role, logGroupState, {
      functionName: streamName,
      description: handler.description,
      tableSchema: table.schema,
      context: service.context,
      debug: options.debug,
      tags: options.tags,
      variables: [options.variables, service.variables, variables],
      architecture,
      logLevel,
      runtime,
      release,
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
  }

  createMapping(state, tableState, handlerState, {
    fromService: internalName
  });

  return handlerState;
};
