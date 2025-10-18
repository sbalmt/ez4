import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { QueueService, QueueImport } from '@ez4/queue/library';
import type { EntryStates } from '@ez4/stateful';
import type { QueueState } from '../queue/types';

import { linkServiceExtras } from '@ez4/project/library';
import { getFunctionState, tryGetFunctionState } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';
import { createLogGroup } from '@ez4/aws-logs';

import { createMapping } from '../mapping/service';
import { createQueueFunction } from '../mapping/function/service';
import { getFunctionName, getInternalName, getMaxWaitForBatchSize } from './utils';
import { RoleMissingError } from './errors';
import { Defaults } from './defaults';

export const prepareSubscriptions = (
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
      const subscriptionName = getFunctionName(service, handler.name, options);
      const dependencies = context.getDependencyFiles(handler.file);

      const logGroupState = createLogGroup(state, {
        retention: subscription.logRetention ?? Defaults.LogRetention,
        groupName: subscriptionName,
        tags: options.tags
      });

      handlerState = createQueueFunction(state, context.role, logGroupState, {
        functionName: subscriptionName,
        description: handler.description,
        messageSchema: service.schema,
        timeout: service.timeout ?? Defaults.Timeout,
        memory: subscription.memory ?? Defaults.Memory,
        extras: service.extras,
        debug: options.debug,
        tags: options.tags,
        handler: {
          sourceFile: handler.file,
          functionName: handler.name,
          module: handler.module,
          dependencies
        },
        listener: listener && {
          functionName: listener.name,
          sourceFile: listener.file,
          module: listener.module
        },
        variables: {
          ...options.variables,
          ...service.variables,
          ...subscription.variables
        }
      });

      context.setServiceState(handlerState, internalName, options);
    }

    const { batch = Defaults.Batch, concurrency } = subscription;
    const { fifoMode } = service;

    createMapping(state, queueState, handlerState, {
      fromService: internalName,
      concurrency,
      batch: {
        ...(!fifoMode && { maxWait: getMaxWaitForBatchSize(batch) }),
        size: batch
      }
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
