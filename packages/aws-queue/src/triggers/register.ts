import type { PrepareResourceEvent } from '@ez4/project/library';

import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerAwsFunctionTriggers } from '@ez4/aws-function';
import { registerTriggers as registerQueueTriggers } from '@ez4/queue/library';

import { createTrigger } from '@ez4/project/library';

import { registerQueueProvider } from '../queue/provider.js';
import { prepareExecutionPolicy } from './policy.js';
import { prepareQueueServices } from './service.js';
import { prepareLinkedService } from './client.js';
import { prepareQueueImports } from './import.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerAwsTriggers();
  registerAwsIdentityTriggers();
  registerAwsFunctionTriggers();
  registerQueueTriggers();

  createTrigger('@ez4/aws-queue', {
    'deploy:prepareExecutionPolicy': prepareExecutionPolicy,
    'deploy:prepareLinkedService': prepareLinkedService,
    'deploy:prepareResources': async (event: PrepareResourceEvent) => {
      await Promise.all([prepareQueueServices(event), prepareQueueImports(event)]);
    }
  });

  registerQueueProvider();

  isRegistered = true;
};
