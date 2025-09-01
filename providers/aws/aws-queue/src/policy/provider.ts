import { registerProvider } from '@ez4/aws-common';

import { getQueuePolicyHandler } from './handler';
import { QueuePolicyServiceType } from './types';

export const registerPolicyProvider = () => {
  registerProvider(QueuePolicyServiceType, getQueuePolicyHandler());
};
