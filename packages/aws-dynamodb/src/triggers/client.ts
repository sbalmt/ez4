import type { ExtraSource, ServiceEvent } from '@ez4/project/library';
import type { Database } from '@ez4/database';

import { Index } from '@ez4/database';
import { isDatabaseService } from '@ez4/database/library';
import { getTableName } from './utils.js';

export const prepareLinkedService = async (event: ServiceEvent): Promise<ExtraSource | null> => {
  const { service, options } = event;

  if (!isDatabaseService(service)) {
    return null;
  }

  const tables = service.tables.reduce((current, table) => {
    return {
      ...current,
      [table.name]: {
        tableName: getTableName(service, table, options),
        tableIndexes: getPrimaryIndex(table.indexes),
        tableSchema: table.schema
      }
    };
  }, {});

  return {
    constructor: `make(${JSON.stringify(tables)})`,
    module: 'Client',
    from: '@ez4/aws-dynamodb/client'
  };
};

const getPrimaryIndex = (tableIndexes: Database.Indexes<any>) => {
  for (const indexName in tableIndexes) {
    const indexType = tableIndexes[indexName];

    if (indexType === Index.Primary) {
      return indexName.split(':');
    }
  }

  return [];
};
