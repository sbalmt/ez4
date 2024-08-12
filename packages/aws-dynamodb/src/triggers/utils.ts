import { DatabaseService, DatabaseTable } from '@ez4/database/library';
import { toKebabCase } from '@ez4/utils';

export const getTableName = (
  service: DatabaseService,
  table: DatabaseTable,
  resourcePrefix: string
) => {
  const databaseName = toKebabCase(service.name);
  const tableName = toKebabCase(table.name);

  return `${resourcePrefix}-${databaseName}-${tableName}`;
};
