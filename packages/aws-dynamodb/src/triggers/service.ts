import type { ConnectResourceEvent, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { isDatabaseService } from '@ez4/database/library';
import { linkServiceExtras } from '@ez4/project/library';
import { getFunctionState } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';

import { createTable } from '../table/service.js';
import { RoleMissingError, UnsupportedRelationError } from './errors.js';
import { getInternalName, getTableName } from './utils.js';
import { prepareLinkedClient } from './client.js';
import { getAttributeSchema } from './schema.js';
import { prepareTableStream } from './stream.js';

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (isDatabaseService(service) && service.engine === 'dynamodb') {
    return prepareLinkedClient(context, service, options);
  }

  return null;
};

export const prepareDatabaseServices = async (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isDatabaseService(service) || service.engine !== 'dynamodb') {
    return;
  }

  for (const table of service.tables) {
    if (table.relations) {
      throw new UnsupportedRelationError();
    }

    const { attributeSchema, ttlAttribute } = getAttributeSchema(table.indexes, table.schema);

    const tableState = createTable(state, {
      tableName: getTableName(service, table, options),
      enableStreams: !!table.stream,
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

    const { handler } = table.stream;

    const internalName = getInternalName(service, table, handler.name);
    const handlerState = getFunctionState(context, internalName, options);

    linkServiceExtras(state, handlerState.entryId, service.extras);
  }
};
