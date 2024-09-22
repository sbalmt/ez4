import type { DeployOptions, PrepareResourceEvent } from '@ez4/project/library';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { QueueService } from '@ez4/queue/library';
import type { QueueState } from '../queue/types.js';

import { getServiceName } from '@ez4/project/library';
import { isQueueService } from '@ez4/queue/library';
import { getFunction } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';

import { createQueue } from '../queue/service.js';
import { createQueueFunction } from '../mapping/function/service.js';
import { createMapping } from '../mapping/service.js';
import { getMappingName } from './utils.js';

export const prepareQueueServices = async (event: PrepareResourceEvent) => {
  const { state, service, options, role } = event;

  if (!isQueueService(service)) {
    return;
  }

  const { timeout, retention, polling, delay } = service;

  const queueState = createQueue(state, {
    queueName: getServiceName(service, options),
    ...(timeout !== undefined && { timeout }),
    ...(retention !== undefined && { retention }),
    ...(polling !== undefined && { polling }),
    ...(delay !== undefined && { delay })
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
  if (!role || !isRoleState(role)) {
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
