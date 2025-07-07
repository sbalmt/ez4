import type { DatabaseService } from '@ez4/database/library';
import type { DeployOptions, ServiceMetadata } from '@ez4/project/library';

import { isDatabaseService } from '@ez4/database/library';
import { getServiceName } from '@ez4/project/library';
import { toSnakeCase } from '@ez4/utils';

export const getClusterName = (service: DatabaseService, options: DeployOptions) => {
  return getServiceName(service, options);
};

export const getInstanceName = (service: DatabaseService, options: DeployOptions) => {
  return `${getClusterName(service, options)}-instance`;
};

export const getDatabaseName = (service: DatabaseService, options: DeployOptions) => {
  const projectName = toSnakeCase(options.projectName);
  const serviceName = toSnakeCase(service.name);

  return `${projectName}_${serviceName}`;
};

export const isAuroraService = (service: ServiceMetadata): service is DatabaseService => {
  return isDatabaseService(service) && service.engine.name === 'aurora';
};
