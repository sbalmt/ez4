import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { createTrigger } from '@ez4/project/library';

import { registerPolicyProvider } from '../policy/provider.js';
import { registerRoleProvider } from '../role/provider.js';
import { prepareExecutionRole } from './role.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerAwsTriggers();

  createTrigger('@ez4/aws-identity', {
    'deploy:prepareExecutionRole': prepareExecutionRole
  });

  registerPolicyProvider();
  registerRoleProvider();

  isRegistered = true;
};
