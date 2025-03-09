import type { ConnectResourceEvent, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { isDatabaseService } from '@ez4/database/library';
import { linkServiceExtras } from '@ez4/project/library';
import { getFunction } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';

import { createTable } from '../table/service.js';
import { RoleMissingError, UnsupportedRelationError } from './errors.js';
import { getStreamName, getTableName } from './utils.js';
import { prepareLinkedClient } from './client.js';
import { getAttributeSchema } from './schema.js';
import { prepareTableStream } from './stream.js';

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (!isDatabaseService(service) || service.engine !== 'dynamodb') {
    return null;
  }

  return prepareLinkedClient(context, service, options);
};

export const prepareDatabaseServices = async (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isDatabaseService(service) || service.engine !== 'dynamodb') {
    return;
  }

  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  for (const table of service.tables) {
    const tableName = getTableName(service, table, options);

    if (table.relations) {
      throw new UnsupportedRelationError();
    }

    const { attributeSchema, ttlAttribute } = getAttributeSchema(table.indexes, table.schema);

    const tableState = createTable(state, {
      enableStreams: !!table.stream,
      attributeSchema,
      ttlAttribute,
      tableName
    });

    context.setServiceState(tableState, table.name, options);

    prepareTableStream(state, service, context.role, table, tableState, options);
  }
};

export const connectDatabaseServices = (event: ConnectResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isDatabaseService(service) || !service.extras || service.engine !== 'dynamodb') {
    return;
  }

  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  for (const table of service.tables) {
    if (!table.stream) {
      continue;
    }

    const streamHandler = table.stream.handler;
    const functionName = getStreamName(service, table, streamHandler.name, options);
    const functionState = getFunction(state, context.role, functionName);

    if (functionState) {
      linkServiceExtras(state, functionState.entryId, service.extras);
    }
  }
};
