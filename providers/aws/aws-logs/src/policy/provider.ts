import { registerProvider } from '@ez4/aws-common';

import { getLogPolicyHandler } from './handler';
import { LogPolicyServiceType } from './types';

export const registerPolicyProvider = () => {
  registerProvider(LogPolicyServiceType, getLogPolicyHandler());
};
