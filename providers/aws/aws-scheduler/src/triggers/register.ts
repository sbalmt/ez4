import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerAwsFunctionTriggers } from '@ez4/aws-function';
import { registerTriggers as registerSchedulerTriggers } from '@ez4/scheduler/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerGroupProvider } from '../group/provider';
import { registerScheduleProvider } from '../schedule/provider';
import { prepareLinkedServices, prepareCronServices, connectCronResources } from './service';
import { prepareIdentityAccount } from './identity';
import { prepareExecutionPolicy } from './policy';

export const registerTriggers = () => {
  registerAwsTriggers();
  registerAwsIdentityTriggers();
  registerAwsFunctionTriggers();
  registerSchedulerTriggers();

  tryCreateTrigger('@ez4/aws-scheduler', {
    'deploy:prepareIdentityAccount': prepareIdentityAccount,
    'deploy:prepareExecutionPolicy': prepareExecutionPolicy,
    'deploy:prepareLinkedService': prepareLinkedServices,
    'deploy:prepareResources': prepareCronServices,
    'deploy:connectResources': connectCronResources
  });

  registerScheduleProvider();
  registerGroupProvider();
};
