import type { QueueService, QueueImport } from '@ez4/queue/library';
import type { DeployOptions } from '@ez4/project/library';
import type { RoleState } from '@ez4/aws-identity';
import type { EntryStates } from '@ez4/stateful';
import type { QueueState } from '../queue/types.js';

import { linkServiceExtras } from '@ez4/project/library';
import { getFunction } from '@ez4/aws-function';

import { createMapping } from '../mapping/service.js';
import { createQueueFunction } from '../mapping/function/service.js';
import { getMappingName } from './utils.js';

export const prepareSubscriptions = async (
  state: EntryStates,
  service: QueueService | QueueImport,
  role: RoleState,
  queueState: QueueState,
  options: DeployOptions
) => {
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
        debug: options.debug,
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

export const connectSubscriptions = (
  state: EntryStates,
  service: QueueService | QueueImport,
  role: RoleState,
  options: DeployOptions
) => {
  if (!service.extras) {
    return;
  }

  for (const { handler } of service.subscriptions) {
    const functionName = getMappingName(service, handler.name, options);
    const functionState = getFunction(state, role, functionName);

    if (functionState) {
      linkServiceExtras(state, functionState.entryId, service.extras);
    }
  }
};
