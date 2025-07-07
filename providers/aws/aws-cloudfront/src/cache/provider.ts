import { registerProvider } from '@ez4/aws-common';

import { getPolicyHandler } from './handler.js';
import { CacheServiceType } from './types.js';

export const registerCachePolicyProvider = () => {
  registerProvider(CacheServiceType, getPolicyHandler());
};
