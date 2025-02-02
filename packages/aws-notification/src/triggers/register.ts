import type {
  PrepareResourceEvent,
  ConnectResourceEvent,
  ServiceEvent
} from '@ez4/project/library';

import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerAwsFunctionTriggers } from '@ez4/aws-function';
import { registerTriggers as registerNotificationTriggers } from '@ez4/notification/library';

import { createTrigger } from '@ez4/project/library';

import { registerTopicProvider } from '../topic/provider.js';
import { registerSubscriptionProvider } from '../subscription/provider.js';
import { connectServices, prepareLinkedServices, prepareServices } from './service.js';
import { connectImports, prepareImports, prepareLinkedImports } from './import.js';
import { prepareExecutionPolicy } from './policy.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerAwsTriggers();
  registerAwsIdentityTriggers();
  registerAwsFunctionTriggers();
  registerNotificationTriggers();

  createTrigger('@ez4/aws-queue', {
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

const prepareQueueResources = async (event: PrepareResourceEvent) => {
  await Promise.all([prepareServices(event), prepareImports(event)]);
};

const connectQueueResources = async (event: ConnectResourceEvent) => {
  await Promise.all([connectServices(event), connectImports(event)]);
};
