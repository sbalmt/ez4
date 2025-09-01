import { registerProvider } from '@ez4/aws-common';

import { getPolicyHandler } from './handler';
import { CacheServiceType } from './types';

export const registerCachePolicyProvider = () => {
  registerProvider(CacheServiceType, getPolicyHandler());
};
