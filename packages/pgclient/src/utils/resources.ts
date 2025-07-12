import { DatabaseService } from '@ez4/database/library';
import { DeployOptions } from '@ez4/project/library';
import { toSnakeCase } from '@ez4/utils';

export const getTableName = (table: string) => {
  return toSnakeCase(table);
};

export const getDatabaseName = (service: DatabaseService, options: DeployOptions) => {
  const projectName = toSnakeCase(options.projectName);
  const serviceName = toSnakeCase(service.name);

  return `${projectName}_${serviceName}`;
};