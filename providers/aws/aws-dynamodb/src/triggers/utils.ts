import type { DatabaseService, DatabaseTable } from '@ez4/database/library';
import type { DeployOptions, ServiceMetadata } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { isDatabaseService } from '@ez4/database/library';
import { toKebabCase } from '@ez4/utils';

import { getTableName } from '../utils/table';

export const getInternalName = (service: DatabaseService, table: DatabaseTable, suffixName?: string) => {
  const internalName = `${toKebabCase(service.name)}-${toKebabCase(table.name)}`;

  return suffixName ? `${internalName}-${toKebabCase(suffixName)}` : internalName;
};

export const getStreamName = (service: DatabaseService, table: DatabaseTable, handlerName: string, options: DeployOptions) => {
  return `${getTableName(getServiceName(service, options), table)}-${toKebabCase(handlerName)}`;
};

export const isDynamoDbService = (service: ServiceMetadata): service is DatabaseService => {
  return isDatabaseService(service) && service.engine.name === 'dynamodb';
};
