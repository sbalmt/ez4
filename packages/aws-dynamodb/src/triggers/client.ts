import type { ExtraSource, ServiceEvent } from '@ez4/project/library';
import type { TableIndex } from '@ez4/database/library';

import { Index } from '@ez4/database';
import { isDatabaseService } from '@ez4/database/library';
import { getTableName } from './utils.js';

export const prepareLinkedService = async (event: ServiceEvent): Promise<ExtraSource | null> => {
  const { service, options } = event;

  if (!isDatabaseService(service) || service.engine !== 'dynamodb') {
    return null;
  }

  const repository = service.tables.reduce((current, table) => {
    return {
      ...current,
      [table.name]: {
        tableName: getTableName(service, table, options),
        tableIndexes: getTableIndexes(table.indexes),
        tableSchema: table.schema
      }
    };
  }, {});

  return {
    constructor: `make(${JSON.stringify(repository)})`,
    module: 'Client',
    from: '@ez4/aws-dynamodb/client'
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
