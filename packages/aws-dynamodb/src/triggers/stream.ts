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

  const { handler, listener } = tableStream;

  const functionName = getStreamName(service, table, handler.name, options);
  const functionTimeout = tableStream.timeout ?? 30;
  const functionMemory = tableStream.memory ?? 192;

  const functionState =
    getFunction(state, role, functionName) ??
    createStreamFunction(state, role, {
      functionName,
      description: handler.description,
      tableSchema: table.schema,
      timeout: functionTimeout,
      memory: functionMemory,
      extras: service.extras,
      debug: options.debug,
      variables: {
        ...service.variables,
        ...tableStream.variables
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

  createMapping(state, tableState, functionState, {});
};
