import type { ConnectResourceEvent, PrepareResourceEvent } from '@ez4/project/library';

import { isDatabaseService } from '@ez4/database/library';
import { linkServiceExtras } from '@ez4/project/library';
import { getFunction } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';

import { createTable } from '../table/service.js';
import { createMapping } from '../mapping/service.js';
import { createStreamFunction } from '../mapping/function/service.js';
import { getStreamName, getTableName } from './utils.js';
import { getAttributeSchema } from './schema.js';

export const prepareDatabaseServices = async (event: PrepareResourceEvent) => {
  const { state, service, role, options } = event;

  if (!isDatabaseService(service) || service.engine !== 'dynamodb') {
    return;
  }

  for (const table of service.tables) {
    const tableName = getTableName(service, table, options);
    const tableStream = table.stream;

    const { primarySchema, secondarySchema, ttlAttribute } = getAttributeSchema(
      table.indexes,
      table.schema
    );

    const tableState = createTable(state, {
      enableStreams: !!tableStream,
      primarySchema,
      secondarySchema,
      ttlAttribute,
      tableName
    });

    if (tableStream) {
      if (!role || !isRoleState(role)) {
        throw new Error(`Execution role for DynamoDB stream is missing.`);
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
    }
  }
};

export const connectDatabaseServices = (event: ConnectResourceEvent) => {
  const { state, service, role, options } = event;

  if (!isDatabaseService(service) || service.engine !== 'dynamodb' || !service.extras) {
    return;
  }

  if (!role || !isRoleState(role)) {
    throw new Error(`Execution role for DynamoDB stream is missing.`);
  }

  for (const table of service.tables) {
    if (!table.stream) {
      continue;
    }

    const streamHandler = table.stream.handler;
    const functionName = getStreamName(service, table, streamHandler.name, options);
    const functionState = getFunction(state, role, functionName);

    if (functionState) {
      linkServiceExtras(state, functionState.entryId, service.extras);
    }
  }
};
