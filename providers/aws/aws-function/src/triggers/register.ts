import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerAwsLogsTriggers } from '@ez4/aws-logs';

import { registerFunctionProvider } from '../function/provider';
import { registerPermissionProvider } from '../permission/provider';
import { registerMappingProvider } from '../mapping/provider';

export const registerTriggers = () => {
  registerAwsTriggers();
  registerAwsIdentityTriggers();
  registerAwsLogsTriggers();

  registerFunctionProvider();
  registerPermissionProvider();
  registerMappingProvider();
};
