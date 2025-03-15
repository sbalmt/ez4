import type { DatabaseService, DatabaseTable } from '@ez4/database/library';
import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryStates } from '@ez4/stateful';
import type { TableState } from '../table/types.js';

import { tryGetFunctionState } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';

import { createMapping } from '../mapping/service.js';
import { createStreamFunction } from '../mapping/function/service.js';
import { getInternalName, getStreamName } from './utils.js';
import { RoleMissingError } from './errors.js';

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

  const { stream } = table;

  const { handler, listener } = stream;

  const internalName = getInternalName(service, table, handler.name);

  let handlerState = tryGetFunctionState(context, internalName, options);

  if (!handlerState) {
    handlerState = createStreamFunction(state, context.role, {
      functionName: getStreamName(service, table, handler.name, options),
      description: handler.description,
      tableSchema: table.schema,
      timeout: stream.timeout ?? 30,
      memory: stream.memory ?? 192,
      extras: service.extras,
      debug: options.debug,
      variables: {
        ...options.variables,
        ...service.variables,
        ...stream.variables
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
  }

  createMapping(state, tableState, handlerState, {
    fromService: internalName
  });

  return handlerState;
};
