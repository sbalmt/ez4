import { registerProvider } from '@ez4/aws-common';

import { getPolicyHandler } from './handler';
import { OriginServiceType } from './types';

export const registerOriginPolicyProvider = () => {
  registerProvider(OriginServiceType, getPolicyHandler());
};
