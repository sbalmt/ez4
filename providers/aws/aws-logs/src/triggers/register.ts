import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';

import { registerLogGroupProvider } from '../group/provider';
import { registerPolicyProvider } from '../policy/provider';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerAwsTriggers();
  registerLogGroupProvider();
  registerPolicyProvider();

  isRegistered = true;
};
