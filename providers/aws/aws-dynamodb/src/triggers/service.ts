import type { ConnectResourceEvent, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { InsensitiveMode, LockMode, OrderMode, PaginationMode, ParametersMode, TransactionMode } from '@ez4/database';
import { getServiceName, linkServiceContext } from '@ez4/project/library';
import { createVirtualState } from '@ez4/common/library';
import { getFunctionState } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';

import {
  RoleMissingError,
  UnsupportedPaginationModeError,
  UnsupportedTransactionModeError,
  UnsupportedInsensitiveModeError,
  UnsupportedParametersModeError,
  UnsupportedOrderModeError,
  UnsupportedRelationError,
  UnsupportedLockModeError
} from './errors';

import { getTableName } from '../utils/table';
import { createTable } from '../table/service';
import { getAttributeSchema } from '../utils/schema';
import { getInternalName, isDynamoDbService } from './utils';
import { prepareLinkedClient } from './client';
import { prepareTableStream } from './stream';

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (isDynamoDbService(service)) {
    return prepareLinkedClient(context, service, options);
  }

  return null;
};

export const prepareDatabaseServices = (event: PrepareResourceEvent) => {
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

  if (engine.orderMode !== OrderMode.IndexColumns) {
    throw new UnsupportedOrderModeError(engine.orderMode);
  }

  if (engine.lockMode !== LockMode.Unsupported) {
    throw new UnsupportedLockModeError();
  }

  const tablePrefix = getServiceName(service, options);

  for (const table of service.tables) {
    if (table.relations) {
      throw new UnsupportedRelationError();
    }

    const { attributeSchema, ttlAttribute } = getAttributeSchema(table.indexes, table.schema);

    const tableState = createTable(state, {
      tableName: getTableName(tablePrefix, table),
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

    context.setServiceState(internalName, options, tableState);

    prepareTableStream(state, service, table, tableState, options, context);
  }

  context.setVirtualServiceState(service, options, createVirtualState(service));

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

    linkServiceContext(state, handlerState.entryId, service.context);
  }
};
