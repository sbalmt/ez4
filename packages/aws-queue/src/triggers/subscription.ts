import type { DeployOptions } from '@ez4/project/library';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { QueueService, QueueImport } from '@ez4/queue/library';
import type { QueueState } from '../queue/types.js';

import { getFunction } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';

import { createMapping } from '../mapping/service.js';
import { createQueueFunction } from '../mapping/function/service.js';
import { getMappingName } from './utils.js';

export const prepareSubscriptions = async (
  state: EntryStates,
  service: QueueService | QueueImport,
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
      createQueueFunction(state, role, {
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
      });

    createMapping(state, queueState, functionState, {
      concurrency: subscription.concurrency
    });
  }
};
