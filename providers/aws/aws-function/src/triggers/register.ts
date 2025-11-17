import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerAwsLogsTriggers } from '@ez4/aws-logs';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerFunctionProvider } from '../function/provider';
import { registerPermissionProvider } from '../permission/provider';
import { registerMappingProvider } from '../mapping/provider';
import { prepareIdentityAccount } from './identity';
import { prepareExecutionPolicy } from './policy';

export const registerTriggers = () => {
  registerAwsTriggers();
  registerAwsIdentityTriggers();
  registerAwsLogsTriggers();

  tryCreateTrigger('@ez4/aws-function', {
    'deploy:prepareIdentityAccount': prepareIdentityAccount,
    'deploy:prepareExecutionPolicy': prepareExecutionPolicy
  });

  registerFunctionProvider();
  registerPermissionProvider();
  registerMappingProvider();
};
