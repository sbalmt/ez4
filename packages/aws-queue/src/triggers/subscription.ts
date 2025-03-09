import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { QueueService, QueueImport } from '@ez4/queue/library';
import type { EntryStates } from '@ez4/stateful';
import type { QueueState } from '../queue/types.js';

import { linkServiceExtras } from '@ez4/project/library';
import { getFunction } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';

import { createMapping } from '../mapping/service.js';
import { createQueueFunction } from '../mapping/function/service.js';
import { RoleMissingError, SubscriptionHandlerMissingError } from './errors.js';
import { getFunctionName } from './utils.js';

export const prepareSubscriptions = async (
  state: EntryStates,
  service: QueueService | QueueImport,
  queueState: QueueState,
  options: DeployOptions,
  context: EventContext
) => {
  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  for (const subscription of service.subscriptions) {
    const { handler, listener } = subscription;

    const functionName = getFunctionName(service, handler.name, options);
    const functionTimeout = service.timeout ?? 30;
    const functionMemory = subscription.memory ?? 192;

    const functionState =
      getFunction(state, context.role, functionName) ??
      createQueueFunction(state, context.role, {
        functionName,
        description: handler.description,
        messageSchema: service.schema,
        timeout: functionTimeout,
        memory: functionMemory,
        extras: service.extras,
        debug: options.debug,
        variables: {
          ...service.variables,
          ...subscription.variables
        },
        handler: {
          functionName: handler.name,
          sourceFile: handler.file
        },
        ...(listener && {
          listener: {
            functionName: listener.name,
            sourceFile: listener.file
          }
        })
      });

    createMapping(state, queueState, functionState, {
      concurrency: subscription.concurrency
    });
  }
};

export const connectSubscriptions = (
  state: EntryStates,
  service: QueueService | QueueImport,
  options: DeployOptions,
  context: EventContext
) => {
  if (!service.extras) {
    return;
  }

  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  for (const { handler } of service.subscriptions) {
    const functionName = getFunctionName(service, handler.name, options);
    const functionState = getFunction(state, context.role, functionName);

    if (!functionState) {
      throw new SubscriptionHandlerMissingError(functionName);
    }

    linkServiceExtras(state, functionState.entryId, service.extras);
  }
};
