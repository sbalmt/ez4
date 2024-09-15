import { hashData, toKebabCase } from '@ez4/utils';

import { DistributionServiceType } from './types.js';

export const getDistributionId = (distributionName: string) => {
  return hashData(DistributionServiceType, toKebabCase(distributionName));
};
