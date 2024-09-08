import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerAwsFunctionTriggers } from '@ez4/aws-function';
import { registerTriggers as registerQueueTriggers } from '@ez4/queue/library';

import { createTrigger } from '@ez4/project/library';

import { prepareExecutionPolicy } from './policy.js';
import { prepareLinkedService } from './client.js';
import { prepareQueueServices } from './queue.js';

let isRegistered = false;

/**
 * Register all triggers.
 */
export const registerTriggers = () => {
  if (!isRegistered) {
    registerAwsTriggers();
    registerAwsIdentityTriggers();
    registerAwsFunctionTriggers();
    registerQueueTriggers();

    createTrigger('@ez4/aws-queue', {
      'deploy:prepareExecutionPolicy': prepareExecutionPolicy,
      'deploy:prepareLinkedService': prepareLinkedService,
      'deploy:prepareResources': prepareQueueServices
    });

    isRegistered = true;
  }

  return isRegistered;
};
