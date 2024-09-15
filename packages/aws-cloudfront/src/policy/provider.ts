import { registerProvider } from '@ez4/aws-common';

import { getPolicyHandler } from './handler.js';
import { PolicyServiceType } from './types.js';

export const registerCachePolicyProvider = () => {
  registerProvider(PolicyServiceType, getPolicyHandler());
};
