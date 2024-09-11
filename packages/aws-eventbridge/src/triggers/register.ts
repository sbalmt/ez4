import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerAwsFunctionTriggers } from '@ez4/aws-function';
import { registerTriggers as registerSchedulerTriggers } from '@ez4/scheduler/library';

import { createTrigger } from '@ez4/project/library';

import { prepareExecutionPolicy } from './policy.js';
import { prepareRuleServices } from './rule.js';

let isRegistered = false;

/**
 * Register all triggers.
 */
export const registerTriggers = () => {
  if (!isRegistered) {
    registerAwsTriggers();
    registerAwsIdentityTriggers();
    registerAwsFunctionTriggers();
    registerSchedulerTriggers();

    createTrigger('@ez4/aws-eventbridge', {
      'deploy:prepareExecutionPolicy': prepareExecutionPolicy,
      'deploy:prepareResources': prepareRuleServices
    });

    isRegistered = true;
  }

  return isRegistered;
};
