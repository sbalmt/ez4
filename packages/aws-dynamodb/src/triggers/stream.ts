import type { DatabaseService, DatabaseTable } from '@ez4/database/library';
import type { DeployOptions } from '@ez4/project/library';
import type { RoleState } from '@ez4/aws-identity';
import type { EntryStates } from '@ez4/stateful';
import type { TableState } from '../table/types.js';

import { getFunction } from '@ez4/aws-function';

import { createStreamFunction } from '../mapping/function/service.js';
import { createMapping } from '../mapping/service.js';
import { getStreamName } from './utils.js';

export const prepareTableStream = (
  state: EntryStates,
  service: DatabaseService,
  role: RoleState,
  table: DatabaseTable,
  tableState: TableState,
  options: DeployOptions
) => {
  const tableStream = table.stream;

  if (!tableStream) {
    return;
  }

  const streamHandler = tableStream.handler;
  const functionName = getStreamName(service, table, streamHandler.name, options);

  const functionState =
    getFunction(state, role, functionName) ??
    createStreamFunction(state, role, {
      functionName,
      description: streamHandler.description,
      sourceFile: streamHandler.file,
      handlerName: streamHandler.name,
      timeout: tableStream.timeout,
      memory: tableStream.memory,
      tableSchema: table.schema,
      extras: service.extras,
      variables: {
        ...service.variables,
        ...tableStream.variables
      }
    });

  createMapping(state, tableState, functionState, {});
};
