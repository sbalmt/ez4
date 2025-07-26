import type { DatabaseService, DatabaseTable } from '@ez4/database/library';
import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryStates } from '@ez4/stateful';
import type { TableState } from '../table/types.js';

import { tryGetFunctionState } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';
import { createLogGroup } from '@ez4/aws-logs';

import { createMapping } from '../mapping/service.js';
import { createStreamFunction } from '../mapping/function/service.js';
import { getInternalName, getStreamName } from './utils.js';
import { RoleMissingError } from './errors.js';
import { Defaults } from './defaults.js';

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

  const { handler, listener, logRetention, timeout, memory, variables } = table.stream;

  const internalName = getInternalName(service, table, handler.name);

  let handlerState = tryGetFunctionState(context, internalName, options);

  if (!handlerState) {
    const streamName = getStreamName(service, table, handler.name, options);

    const logGroupState = createLogGroup(state, {
      retention: logRetention ?? Defaults.LogRetention,
      groupName: streamName,
      tags: options.tags
    });

    handlerState = createStreamFunction(state, context.role, logGroupState, {
      functionName: streamName,
      description: handler.description,
      tableSchema: table.schema,
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
        dependencies: context.getDependencies(handler.file),
        functionName: handler.name,
        sourceFile: handler.file,
        module: handler.module
      },
      ...(listener && {
        listener: {
          functionName: listener.name,
          sourceFile: listener.file,
          module: listener.module
        }
      })
    });

    context.setServiceState(handlerState, internalName, options);
  }

  createMapping(state, tableState, handlerState, {
    fromService: internalName
  });

  return handlerState;
};
