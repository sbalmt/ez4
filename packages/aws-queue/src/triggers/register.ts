import type {
  ExtraSource,
  PolicyResourceEvent,
  ServiceResourceEvent,
  ServiceEvent
} from '@ez4/project';

import type { QueueService } from '@ez4/queue/library';
import type { RoleState } from '@ez4/aws-identity';
import type { EntryStates } from '@ez4/stateful';
import type { QueueState } from '../queue/types.js';

import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsFunctionTriggers } from '@ez4/aws-function';
import { registerTriggers as registerQueueTriggers } from '@ez4/queue/library';

import {
  createPolicy,
  getAccountId,
  getRegion,
  isRole,
  registerTriggers as registerAwsIdentityTriggers
} from '@ez4/aws-identity';

import { createTrigger } from '@ez4/project';
import { isQueueService } from '@ez4/queue/library';
import { getFunction } from '@ez4/aws-function';
import { toKebabCase } from '@ez4/utils';

import { getPolicyDocument } from '../utils/policy.js';
import { createFunction } from '../function/service.js';
import { createMapping } from '../mapping/service.js';
import { createQueue } from '../queue/service.js';

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

const getQueueName = (service: QueueService, resourcePrefix: string) => {
  const serviceName = toKebabCase(service.name);

  return `${resourcePrefix}-${serviceName}`;
};

const prepareExecutionPolicy = async (event: PolicyResourceEvent) => {
  const { state, options } = event;
  const { resourcePrefix, projectName } = options;

  return createPolicy(state, {
    policyName: `${resourcePrefix}-${projectName}-queue-policy`,
    policyDocument: await getPolicyDocument(resourcePrefix)
  });
};

const prepareLinkedService = async (event: ServiceEvent): Promise<ExtraSource | null> => {
  const { service, options } = event;

  if (!isQueueService(service)) {
    return null;
  }

  const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

  const queueName = getQueueName(service, options.resourcePrefix);
  const queueUrl = `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`;

  return {
    constructor: `make('${queueUrl}', ${JSON.stringify(service.schema)})`,
    module: 'Client',
    from: '@ez4/aws-queue/client'
  };
};

const prepareQueueServices = async (event: ServiceResourceEvent) => {
  const { state, service, options, role } = event;

  if (!isQueueService(service) || !isRole(role)) {
    return;
  }

  const { timeout, retention, delay } = service;

  const queueState = createQueue(state, {
    queueName: getQueueName(service, options.resourcePrefix),
    ...(timeout !== undefined && { timeout }),
    ...(retention !== undefined && { retention }),
    ...(delay !== undefined && { timeout })
  });

  await prepareSubscriptions(state, service, role, queueState);
};

const prepareSubscriptions = async (
  state: EntryStates,
  service: QueueService,
  executionRole: RoleState,
  queueState: QueueState
) => {
  const serviceName = queueState.parameters.queueName;

  for (const subscription of service.subscriptions) {
    const handler = subscription.handler;

    const functionName = `${serviceName}-${handler.name}`;
    const queueTimeout = service.timeout ?? 30;

    const functionState =
      getFunction(state, executionRole, functionName) ??
      (await createFunction(state, executionRole, {
        functionName,
        description: handler.description,
        sourceFile: handler.file,
        handlerName: handler.name,
        timeout: queueTimeout,
        memory: subscription.memory,
        messageSchema: service.schema,
        extras: service.extras,
        variables: {
          ...service.variables,
          ...subscription.variables
        }
      }));

    createMapping(state, queueState, functionState, {});
  }
};
