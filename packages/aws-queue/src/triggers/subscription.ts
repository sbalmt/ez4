import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { QueueService, QueueImport } from '@ez4/queue/library';
import type { EntryStates } from '@ez4/stateful';
import type { QueueState } from '../queue/types.js';

import { linkServiceExtras } from '@ez4/project/library';
import { getFunctionState, tryGetFunctionState } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';

import { createMapping } from '../mapping/service.js';
import { createQueueFunction } from '../mapping/function/service.js';
import { getFunctionName, getInternalName } from './utils.js';
import { RoleMissingError } from './errors.js';

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

    const internalName = getInternalName(service, handler.name);

    let handlerState = tryGetFunctionState(context, internalName, options);

    if (!handlerState) {
      const functionTimeout = service.timeout ?? 30;
      const functionMemory = subscription.memory ?? 192;

      handlerState = createQueueFunction(state, context.role, {
        functionName: getFunctionName(service, handler.name, options),
        description: handler.description,
        messageSchema: service.schema,
        timeout: functionTimeout,
        memory: functionMemory,
        extras: service.extras,
        debug: options.debug,
        variables: {
          ...options.variables,
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

      context.setServiceState(handlerState, internalName, options);
    }

    createMapping(state, queueState, handlerState, {
      concurrency: subscription.concurrency,
      fromService: internalName
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
    const internalName = getInternalName(service, handler.name);
    const handlerState = getFunctionState(context, internalName, options);

    linkServiceExtras(state, handlerState.entryId, service.extras);
  }
};
