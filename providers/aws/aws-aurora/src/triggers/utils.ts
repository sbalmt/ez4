import type { DatabaseService } from '@ez4/database/library';
import type { CommonOptions, ServiceMetadata } from '@ez4/project/library';

import { isDatabaseService } from '@ez4/database/library';
import { getServiceName } from '@ez4/project/library';

export const getClusterName = (service: DatabaseService, options: CommonOptions) => {
  return getServiceName(service, options);
};

export const getInstanceName = (service: DatabaseService, options: CommonOptions) => {
  return `${getClusterName(service, options)}-instance`;
};

export const isAuroraService = (service: ServiceMetadata): service is DatabaseService => {
  return isDatabaseService(service) && service.engine.name === 'aurora';
};
