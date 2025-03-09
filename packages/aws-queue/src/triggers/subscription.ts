import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { QueueService, QueueImport } from '@ez4/queue/library';
import type { EntryStates } from '@ez4/stateful';
import type { QueueState } from '../queue/types.js';

import { linkServiceExtras } from '@ez4/project/library';
import { getFunctionState, tryGetFunctionState } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';

import { createMapping } from '../mapping/service.js';
import { createQueueFunction } from '../mapping/function/service.js';
import { RoleMissingError } from './errors.js';
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

    let functionState = tryGetFunctionState(context, handler.name, options);

    if (!functionState) {
      const functionTimeout = service.timeout ?? 30;
      const functionMemory = subscription.memory ?? 192;

      functionState = createQueueFunction(state, context.role, {
        functionName: getFunctionName(service, handler.name, options),
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

      context.setServiceState(functionState, handler.name, options);
    }

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
    const functionState = getFunctionState(context, handler.name, options);

    linkServiceExtras(state, functionState.entryId, service.extras);
  }
};
