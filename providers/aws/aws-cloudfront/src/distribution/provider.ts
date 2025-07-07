import { registerProvider } from '@ez4/aws-common';

import { getDistributionHandler } from './handler.js';
import { DistributionServiceType } from './types.js';

export const registerDistributionProvider = () => {
  registerProvider(DistributionServiceType, getDistributionHandler());
};
