import type { DatabaseService } from '@ez4/database/library';
import { getServiceName, type DeployOptions } from '@ez4/project/library';

import { getTableIndexes } from './indexes';
import { getTableName } from './table';

export const getTableRepository = (service: DatabaseService, options: DeployOptions) => {
  const tablePrefix = getServiceName(service, options);

  return service.tables.reduce((current, table) => {
    return {
      ...current,
      [table.name]: {
        name: getTableName(tablePrefix, table),
        indexes: getTableIndexes(table.indexes),
        schema: table.schema
      }
    };
  }, {});
};
