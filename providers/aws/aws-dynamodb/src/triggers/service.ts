import type { ConnectResourceEvent, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { InsensitiveMode, OrderMode, PaginationMode, ParametersMode, TransactionMode } from '@ez4/database';
import { linkServiceExtras } from '@ez4/project/library';
import { getFunctionState } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';

import {
  RoleMissingError,
  UnsupportedPaginationModeError,
  UnsupportedTransactionModeError,
  UnsupportedInsensitiveModeError,
  UnsupportedParametersModeError,
  UnsupportedOrderModeError,
  UnsupportedRelationError
} from './errors.js';

import { createTable } from '../table/service.js';
import { getInternalName, getTableName, isDynamoDbService } from './utils.js';
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
    return false;
  }

  const { engine, scalability } = service;

  if (engine.parametersMode !== ParametersMode.OnlyIndex) {
    throw new UnsupportedParametersModeError(engine.parametersMode);
  }

  if (engine.transactionMode !== TransactionMode.Static) {
    throw new UnsupportedTransactionModeError(engine.transactionMode);
  }

  if (engine.insensitiveMode !== InsensitiveMode.Unsupported) {
    throw new UnsupportedInsensitiveModeError(engine.insensitiveMode);
  }

  if (engine.paginationMode !== PaginationMode.Cursor) {
    throw new UnsupportedPaginationModeError(engine.paginationMode);
  }

  if (engine.orderMode === OrderMode.AnyColumns) {
    throw new UnsupportedOrderModeError(engine.orderMode);
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
      ttlAttribute,
      ...(scalability && {
        capacityUnits: {
          maxReadUnits: scalability.maxCapacity,
          maxWriteUnits: scalability.maxCapacity
        }
      })
    });

    const internalName = getInternalName(service, table);

    context.setServiceState(tableState, internalName, options);

    prepareTableStream(state, service, table, tableState, options, context);
  }

  return true;
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
