import type { DatabaseService, DatabaseTable } from '@ez4/database/library';
import type { DeployOptions, ServiceMetadata } from '@ez4/project/library';

import { isDatabaseService } from '@ez4/database/library';
import { getServiceName } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

export const getTableName = (service: DatabaseService, table: DatabaseTable, options: DeployOptions) => {
  return `${getServiceName(service, options)}-${toKebabCase(table.name)}`;
};

export const getInternalName = (service: DatabaseService, table: DatabaseTable, suffixName?: string) => {
  const internalName = `${toKebabCase(service.name)}-${toKebabCase(table.name)}`;

  return suffixName ? `${internalName}-${toKebabCase(suffixName)}` : internalName;
};

export const getStreamName = (service: DatabaseService, table: DatabaseTable, handlerName: string, options: DeployOptions) => {
  return `${getTableName(service, table, options)}-${toKebabCase(handlerName)}`;
};

export const isDynamoDbService = (service: ServiceMetadata): service is DatabaseService => {
  return isDatabaseService(service) && service.engine.name === 'dynamodb';
};
