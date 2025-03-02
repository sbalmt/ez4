import type { DatabaseService, TableIndex } from '@ez4/database/library';
import type { DeployOptions, ExtraSource } from '@ez4/project/library';

import { Index } from '@ez4/database';

import { getTableName } from './utils.js';

export const prepareLinkedClient = (
  service: DatabaseService,
  options: DeployOptions
): ExtraSource => {
  const repository = service.tables.reduce((current, table) => {
    return {
      ...current,
      [table.name]: {
        name: getTableName(service, table, options),
        indexes: getTableIndexes(table.indexes),
        schema: table.schema
      }
    };
  }, {});

  return {
    constructor: `make(${JSON.stringify(repository)}, ${options.debug ? 'true' : 'false'})`,
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
