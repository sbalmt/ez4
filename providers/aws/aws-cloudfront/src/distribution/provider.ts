import { registerProvider } from '@ez4/aws-common';

import { getDistributionHandler } from './handler';
import { DistributionServiceType } from './types';

export const registerDistributionProvider = () => {
  registerProvider(DistributionServiceType, getDistributionHandler());
};
