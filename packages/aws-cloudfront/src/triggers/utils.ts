import type { CdnService } from '@ez4/distribution/library';
import type { DeployOptions } from '@ez4/project/library';

import { toKebabCase } from '@ez4/utils';

export const getDistributionName = (service: CdnService, options: DeployOptions) => {
  const resourcePrefix = toKebabCase(options.resourcePrefix);
  const projectName = toKebabCase(options.projectName);
  const serviceName = toKebabCase(service.name);

  return `${resourcePrefix}-${projectName}-${serviceName}`;
};
