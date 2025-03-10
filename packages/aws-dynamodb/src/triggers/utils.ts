import type { DatabaseService, DatabaseTable } from '@ez4/database/library';
import type { DeployOptions } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

export const getTableName = (service: DatabaseService, table: DatabaseTable, options: DeployOptions) => {
  return `${getServiceName(service, options)}-${toKebabCase(table.name)}`;
};

export const getInternalName = (service: DatabaseService, table: DatabaseTable, handlerName?: string) => {
  const internalName = `${toKebabCase(service.name)}-${toKebabCase(table.name)}`;

  return handlerName ? `${internalName}-${toKebabCase(handlerName)}` : internalName;
};

export const getStreamName = (service: DatabaseService, table: DatabaseTable, handlerName: string, options: DeployOptions) => {
  return `${getTableName(service, table, options)}-${toKebabCase(handlerName)}`;
};
