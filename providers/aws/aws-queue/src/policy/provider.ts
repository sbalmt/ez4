import { registerProvider } from '@ez4/aws-common';

import { getQueuePolicyHandler } from './handler.js';
import { QueuePolicyServiceType } from './types.js';

export const registerPolicyProvider = () => {
  registerProvider(QueuePolicyServiceType, getQueuePolicyHandler());
};
