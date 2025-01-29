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
