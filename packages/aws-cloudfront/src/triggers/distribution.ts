import type { ServiceResourceEvent } from '@ez4/project/library';

import { isCdnService } from '@ez4/distribution/library';

import { createDistribution } from '../distribution/service.js';
import { getDistributionName } from './utils.js';

export const prepareCdnServices = async (event: ServiceResourceEvent) => {
  const { state, service, options } = event;

  if (!isCdnService(service)) {
    return;
  }

  const { description, defaultIndex, compress, disabled } = service;

  createDistribution(state, {
    distributionName: getDistributionName(service, options),
    enabled: !disabled,
    origins: [],
    defaultIndex,
    description,
    compress
  });
};
