import type { PrepareResourceEvent, ConnectResourceEvent } from '@ez4/project/library';

import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerAwsFunctionTriggers } from '@ez4/aws-function';
import { registerTriggers as registerQueueTriggers } from '@ez4/queue/library';

import { createTrigger } from '@ez4/project/library';

import { registerQueueProvider } from '../queue/provider.js';
import { connectQueueServices, prepareQueueServices } from './service.js';
import { connectQueueImports, prepareQueueImports } from './import.js';
import { prepareExecutionPolicy } from './policy.js';
import { prepareLinkedService } from './client.js';

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
    'deploy:prepareResources': prepareQueueResources,
    'deploy:connectResources': connectQueueResources
  });

  registerQueueProvider();

  isRegistered = true;
};

const prepareQueueResources = async (event: PrepareResourceEvent) => {
  await Promise.all([prepareQueueServices(event), prepareQueueImports(event)]);
};

const connectQueueResources = async (event: ConnectResourceEvent) => {
  await Promise.all([connectQueueServices(event), connectQueueImports(event)]);
};
