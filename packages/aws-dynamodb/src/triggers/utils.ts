import type { DatabaseService, DatabaseTable } from '@ez4/database/library';
import type { DeployOptions } from '@ez4/project/library';

import { toKebabCase } from '@ez4/utils';

export const getTableName = (
  service: DatabaseService,
  table: DatabaseTable,
  options: DeployOptions
) => {
  const resourcePrefix = toKebabCase(options.resourcePrefix);
  const projectName = toKebabCase(options.projectName);
  const databaseName = toKebabCase(service.name);
  const tableName = toKebabCase(table.name);

  return `${resourcePrefix}-${projectName}-${databaseName}-${tableName}`;
};

export const getStreamName = (
  service: DatabaseService,
  table: DatabaseTable,
  handlerName: string,
  options: DeployOptions
) => {
  return `${getTableName(service, table, options)}-${toKebabCase(handlerName)}`;
};
