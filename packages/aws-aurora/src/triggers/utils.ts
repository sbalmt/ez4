import type { DatabaseService } from '@ez4/database/library';
import type { DeployOptions } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';

export const getClusterName = (service: DatabaseService, options: DeployOptions) => {
  return getServiceName(service, options);
};

export const getInstanceName = (service: DatabaseService, options: DeployOptions) => {
  return `${getClusterName(service, options)}-instance`;
};
