import type { PrepareResourceEvent, ConnectResourceEvent, ServiceEvent } from '@ez4/project/library';

import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerAwsFunctionTriggers } from '@ez4/aws-function';
import { registerTriggers as registerQueueTriggers } from '@ez4/queue/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerQueueProvider } from '../queue/provider';
import { registerPolicyProvider } from '../policy/provider';
import { prepareLinkedServices, prepareServices, connectServices } from './service';
import { prepareLinkedImports, prepareImports, connectImports } from './import';
import { prepareExecutionPolicy } from './policy';

export const registerTriggers = () => {
  registerAwsTriggers();
  registerAwsIdentityTriggers();
  registerAwsFunctionTriggers();
  registerQueueTriggers();

  tryCreateTrigger('@ez4/aws-queue', {
    'deploy:prepareExecutionPolicy': prepareExecutionPolicy,
    'deploy:prepareLinkedService': prepareLinkedService,
    'deploy:prepareResources': prepareQueueResources,
    'deploy:connectResources': connectQueueResources
  });

  registerQueueProvider();
  registerPolicyProvider();
};

const prepareLinkedService = (event: ServiceEvent) => {
  return prepareLinkedServices(event) ?? prepareLinkedImports(event) ?? null;
};

const prepareQueueResources = (event: PrepareResourceEvent) => {
  return prepareServices(event) || prepareImports(event);
};

const connectQueueResources = (event: ConnectResourceEvent) => {
  connectServices(event);
  connectImports(event);
};
