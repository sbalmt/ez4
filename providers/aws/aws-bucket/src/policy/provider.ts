import { tryRegisterProvider } from '@ez4/aws-common';

import { getPolicyHandler } from './handler';
import { PolicyServiceType } from './types';

export const registerPolicyProvider = () => {
  tryRegisterProvider(PolicyServiceType, getPolicyHandler());
};
