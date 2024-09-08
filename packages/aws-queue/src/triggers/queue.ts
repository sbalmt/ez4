import type { DeployOptions, ServiceResourceEvent } from '@ez4/project/library';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { QueueService } from '@ez4/queue/library';
import type { QueueState } from '../queue/types.js';

import { isQueueService } from '@ez4/queue/library';
import { getFunction } from '@ez4/aws-function';
import { isRole } from '@ez4/aws-identity';

import { createQueue } from '../queue/service.js';
import { createQueueFunction } from '../mapping/function/service.js';
import { createMapping } from '../mapping/service.js';
import { getMappingName, getQueueName } from './utils.js';

export const prepareQueueServices = async (event: ServiceResourceEvent) => {
  const { state, service, options, role } = event;

  if (!isQueueService(service)) {
    return;
  }

  const { timeout, retention, delay } = service;

  const queueState = createQueue(state, {
    queueName: getQueueName(service, options),
    ...(timeout !== undefined && { timeout }),
    ...(retention !== undefined && { retention }),
    ...(delay !== undefined && { timeout })
  });

  await prepareSubscriptions(state, service, role, queueState, options);
};

const prepareSubscriptions = async (
  state: EntryStates,
  service: QueueService,
  role: EntryState | null,
  queueState: QueueState,
  options: DeployOptions
) => {
  if (!role || !isRole(role)) {
    throw new Error(`Execution role for SQS mapping is missing.`);
  }

  for (const subscription of service.subscriptions) {
    const handler = subscription.handler;

    const functionName = getMappingName(service, handler.name, options);
    const queueTimeout = service.timeout ?? 30;

    const functionState =
      getFunction(state, role, functionName) ??
      (await createQueueFunction(state, role, {
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
