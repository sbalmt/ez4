import type { ConnectResourceEvent, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { TransactionType } from '@ez4/database';
import { linkServiceExtras } from '@ez4/project/library';
import { getFunctionState } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';

import { createTable } from '../table/service.js';
import { getInternalName, getTableName, isDynamoDbService } from './utils.js';
import { RoleMissingError, UnsupportedRelationError, UnsupportedTransactionError } from './errors.js';
import { prepareLinkedClient } from './client.js';
import { getAttributeSchema } from './schema.js';
import { prepareTableStream } from './stream.js';

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (isDynamoDbService(service)) {
    return prepareLinkedClient(context, service, options);
  }

  return null;
};

export const prepareDatabaseServices = async (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isDynamoDbService(service)) {
    return;
  }

  if (service.engine.transaction === TransactionType.Interactive) {
    throw new UnsupportedTransactionError();
  }

  for (const table of service.tables) {
    if (table.relations) {
      throw new UnsupportedRelationError();
    }

    const { attributeSchema, ttlAttribute } = getAttributeSchema(table.indexes, table.schema);

    const tableState = createTable(state, {
      tableName: getTableName(service, table, options),
      enableStreams: !!table.stream,
      tags: options.tags,
      attributeSchema,
      ttlAttribute
    });

    const internalName = getInternalName(service, table);

    context.setServiceState(tableState, internalName, options);

    prepareTableStream(state, service, table, tableState, options, context);
  }
};

export const connectDatabaseServices = (event: ConnectResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isDynamoDbService(service)) {
    return;
  }

  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  for (const table of service.tables) {
    if (!table.stream) {
      continue;
    }

    const { handler } = table.stream;

    const internalName = getInternalName(service, table, handler.name);
    const handlerState = getFunctionState(context, internalName, options);

    linkServiceExtras(state, handlerState.entryId, service.extras);
  }
};
