import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerAwsFunctionTriggers } from '@ez4/aws-function';
import { registerTriggers as registerSchedulerTriggers } from '@ez4/scheduler/library';

import { createTrigger } from '@ez4/project/library';

import { registerScheduleProvider } from '../schedule/provider.js';
import { registerGroupProvider } from '../group/provider.js';

import { prepareIdentityAccount } from './identity.js';
import { prepareExecutionPolicy } from './policy.js';
import { prepareCronServices } from './cron.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerAwsTriggers();
  registerAwsIdentityTriggers();
  registerAwsFunctionTriggers();
  registerSchedulerTriggers();

  createTrigger('@ez4/aws-scheduler', {
    'deploy:prepareIdentityAccount': prepareIdentityAccount,
    'deploy:prepareExecutionPolicy': prepareExecutionPolicy,
    'deploy:prepareResources': prepareCronServices
  });

  registerScheduleProvider();
  registerGroupProvider();

  isRegistered = true;
};
