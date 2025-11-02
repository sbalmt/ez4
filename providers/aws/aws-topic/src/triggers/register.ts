import type { PrepareResourceEvent, ConnectResourceEvent, ServiceEvent } from '@ez4/project/library';

import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerAwsFunctionTriggers } from '@ez4/aws-function';
import { registerTriggers as registerAwsQueueTriggers } from '@ez4/aws-queue';
import { registerTriggers as registerTopicTriggers } from '@ez4/topic/library';

import { createTrigger } from '@ez4/project/library';

import { registerTopicProvider } from '../topic/provider';
import { registerSubscriptionProvider } from '../subscription/provider';
import { connectServices, prepareLinkedServices, prepareServices } from './service';
import { connectImports, prepareImports, prepareLinkedImports } from './import';
import { prepareExecutionPolicy } from './policy';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerAwsTriggers();
  registerAwsIdentityTriggers();
  registerAwsFunctionTriggers();
  registerAwsQueueTriggers();
  registerTopicTriggers();

  createTrigger('@ez4/aws-topic', {
    'deploy:prepareExecutionPolicy': prepareExecutionPolicy,
    'deploy:prepareLinkedService': prepareLinkedService,
    'deploy:prepareResources': prepareQueueResources,
    'deploy:connectResources': connectQueueResources
  });

  registerTopicProvider();
  registerSubscriptionProvider();

  isRegistered = true;
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
