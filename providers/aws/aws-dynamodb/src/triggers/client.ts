import type { DeployOptions, EmulateClientEvent, EventContext, ExtraSource } from '@ez4/project/library';
import type { DatabaseService, TableIndex } from '@ez4/database/library';

import { Index } from '@ez4/database';

import { getTableState } from '../table/utils.js';
import { Client } from '../client.js';
import { getInternalName, getTableName, isDynamoDbService } from './utils.js';

export const prepareLinkedClient = (context: EventContext, service: DatabaseService, options: DeployOptions): ExtraSource => {
  const tableIds = service.tables.map((table) => {
    const internalName = getInternalName(service, table);
    const tableState = getTableState(context, internalName, options);

    return tableState.entryId;
  });

  return {
    entryIds: tableIds,
    from: '@ez4/aws-dynamodb/client',
    module: 'Client',
    constructor: `make(${JSON.stringify({
      repository: getTableRepository(service, options),
      debug: options.debug
    })})`
  };
};

export const prepareEmulatorClient = (event: EmulateClientEvent) => {
  const { service, options } = event;

  if (!isDynamoDbService(service)) {
    return null;
  }

  return Client.make({
    repository: getTableRepository(service, options),
    debug: options.debug
  });
};

const getTableRepository = (service: DatabaseService, options: DeployOptions) => {
  return service.tables.reduce((current, table) => {
    return {
      ...current,
      [table.name]: {
        name: getTableName(service, table, options),
        indexes: getTableIndexes(table.indexes),
        schema: table.schema
      }
    };
  }, {});
};

const getTableIndexes = (tableIndexes: TableIndex[]): string[][] => {
  const indexes = [];

  for (const { columns, type } of tableIndexes) {
    if (type === Index.Primary) {
      indexes.unshift(columns);
    } else if (type === Index.Secondary) {
      indexes.push(columns);
    }
  }

  return indexes;
};
