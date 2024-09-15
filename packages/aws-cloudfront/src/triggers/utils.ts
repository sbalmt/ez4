import type { DeployOptions } from '@ez4/project/library';
import type { CdnService } from '@ez4/distribution/library';

import { getServiceName } from '@ez4/project/library';

export const getCachePolicyName = (service: CdnService, options: DeployOptions) => {
  return `${getServiceName(service, options)}-policy`;
};

export const getOriginAccessName = (service: CdnService, options: DeployOptions) => {
  return `${getServiceName(service, options)}-access`;
};
