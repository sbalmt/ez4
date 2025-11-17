import { tryRegisterProvider } from '@ez4/aws-common';

import { getDistributionHandler } from './handler';
import { DistributionServiceType } from './types';

export const registerDistributionProvider = () => {
  tryRegisterProvider(DistributionServiceType, getDistributionHandler());
};
