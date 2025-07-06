import type { DeployOptions, EventContext, ExtraSource } from '@ez4/project/library';
import type { DatabaseService, TableIndex } from '@ez4/database/library';

import { Index } from '@ez4/database';

import { getTableState } from '../table/utils.js';
import { getInternalName, getTableName } from './utils.js';

export const prepareLinkedClient = (context: EventContext, service: DatabaseService, options: DeployOptions): ExtraSource => {
  const tableIds: string[] = [];

  const repository = JSON.stringify(
    service.tables.reduce((current, table) => {
      const internalName = getInternalName(service, table);

      const tableState = getTableState(context, internalName, options);

      tableIds.push(tableState.entryId);

      return {
        ...current,
        [table.name]: {
          name: getTableName(service, table, options),
          indexes: getTableIndexes(table.indexes),
          schema: table.schema
        }
      };
    }, {})
  );

  const settings = JSON.stringify({
    debug: options.debug
  });

  return {
    entryIds: tableIds,
    constructor: `make(${repository}, ${settings})`,
    from: '@ez4/aws-dynamodb/client',
    module: 'Client'
  };
};

const getTableIndexes = (tableIndexes: TableIndex[]): string[][] => {
  const indexes = [];

  for (const { columns, type } of tableIndexes) {
    if (type === Index.Primary || type === Index.Secondary) {
      indexes.push(columns);
    }
  }

  return indexes;
};
