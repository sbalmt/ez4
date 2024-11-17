import { registerProvider } from '@ez4/aws-common';

import { getPolicyHandler } from './handler.js';
import { OriginServiceType } from './types.js';

export const registerOriginPolicyProvider = () => {
  registerProvider(OriginServiceType, getPolicyHandler());
};
