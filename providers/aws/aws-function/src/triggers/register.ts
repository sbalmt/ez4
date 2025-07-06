import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerAwsLogsTriggers } from '@ez4/aws-logs';
import { createTrigger } from '@ez4/project/library';

import { registerFunctionProvider } from '../function/provider.js';
import { registerPermissionProvider } from '../permission/provider.js';
import { registerMappingProvider } from '../mapping/provider.js';
import { prepareIdentityAccount } from './identity.js';
import { prepareExecutionPolicy } from './policy.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerAwsTriggers();
  registerAwsIdentityTriggers();
  registerAwsLogsTriggers();

  createTrigger('@ez4/aws-function', {
    'deploy:prepareIdentityAccount': prepareIdentityAccount,
    'deploy:prepareExecutionPolicy': prepareExecutionPolicy
  });

  registerFunctionProvider();
  registerPermissionProvider();
  registerMappingProvider();

  isRegistered = true;
};
