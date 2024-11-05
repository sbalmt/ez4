import type { ExtraSource, ServiceEvent } from '@ez4/project/library';
import type { Database } from '@ez4/database';

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

const getTableIndexes = (tableIndexes: Database.Indexes<any>) => {
  const indexes = [];

  for (const indexName in tableIndexes) {
    const indexType = tableIndexes[indexName];
    const indexParts = indexName.split(':');

    switch (indexType) {
      case Index.Primary:
      case Index.Secondary:
        indexes.push(indexParts);
        break;
    }
  }

  return indexes;
};
