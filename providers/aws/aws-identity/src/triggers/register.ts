import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerPolicyProvider } from '../policy/provider';
import { registerRoleProvider } from '../role/provider';
import { prepareExecutionRole } from './role';

export const registerTriggers = () => {
  registerAwsTriggers();

  tryCreateTrigger('@ez4/aws-identity', {
    'deploy:prepareExecutionRole': prepareExecutionRole
  });

  registerPolicyProvider();
  registerRoleProvider();
};
