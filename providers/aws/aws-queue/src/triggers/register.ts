import type { PrepareResourceEvent, ConnectResourceEvent, ServiceEvent } from '@ez4/project/library';

import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerAwsFunctionTriggers } from '@ez4/aws-function';
import { registerTriggers as registerQueueTriggers } from '@ez4/queue/library';

import { createTrigger } from '@ez4/project/library';

import { registerQueueProvider } from '../queue/provider.js';
import { registerPolicyProvider } from '../policy/provider.js';
import { prepareLinkedServices, prepareServices, connectServices } from './service.js';
import { prepareLinkedImports, prepareImports, connectImports } from './import.js';
import { prepareExecutionPolicy } from './policy.js';

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
  registerPolicyProvider();

  isRegistered = true;
};

const prepareLinkedService = (event: ServiceEvent) => {
  return prepareLinkedServices(event) ?? prepareLinkedImports(event) ?? null;
};

const prepareQueueResources = async (event: PrepareResourceEvent) => {
  return (await prepareServices(event)) || (await prepareImports(event));
};

const connectQueueResources = async (event: ConnectResourceEvent) => {
  await Promise.all([connectServices(event), connectImports(event)]);
};
