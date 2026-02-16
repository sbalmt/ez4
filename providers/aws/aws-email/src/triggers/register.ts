import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerEmailTriggers } from '@ez4/email/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerIdentityProvider } from '../identity/provider';
import { prepareLinkedServices, prepareServices } from './service';
import { prepareExecutionPolicy } from './policy';

export const registerTriggers = () => {
  registerAwsTriggers();
  registerAwsIdentityTriggers();
  registerEmailTriggers();

  tryCreateTrigger('@ez4/aws-email', {
    'deploy:prepareExecutionPolicy': prepareExecutionPolicy,
    'deploy:prepareLinkedService': prepareLinkedServices,
    'deploy:prepareResources': prepareServices
  });

  registerIdentityProvider();
};
