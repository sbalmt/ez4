import { tryRegisterProvider } from '@ez4/aws-common';

import { getLogPolicyHandler } from './handler';
import { LogPolicyServiceType } from './types';

export const registerPolicyProvider = () => {
  tryRegisterProvider(LogPolicyServiceType, getLogPolicyHandler());
};
