import type { NotificationService, NotificationImport } from '@ez4/notification/library';
import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryStates } from '@ez4/stateful';
import type { TopicState } from '../topic/types.js';

import { linkServiceExtras } from '@ez4/project/library';
import { NotificationSubscriptionType } from '@ez4/notification/library';
import { getFunctionState, tryGetFunctionState } from '@ez4/aws-function';
import { InvalidParameterError } from '@ez4/aws-common';
import { isRoleState } from '@ez4/aws-identity';
import { getQueueState } from '@ez4/aws-queue';

import { SubscriptionServiceName } from '../subscription/types.js';
import { createSubscriptionFunction } from '../subscription/function/service.js';
import { createSubscription } from '../subscription/service.js';
import { getFunctionName, getInternalName } from './utils.js';
import { RoleMissingError } from './errors.js';

export const prepareSubscriptions = async (
  state: EntryStates,
  service: NotificationService | NotificationImport,
  topicState: TopicState,
  options: DeployOptions,
  context: EventContext
) => {
  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  for (const subscription of service.subscriptions) {
    switch (subscription.type) {
      default:
        throw new InvalidParameterError(SubscriptionServiceName, `subscription not supported.`);

      case NotificationSubscriptionType.Lambda: {
        if (service.fifoMode) {
          throw new InvalidParameterError(SubscriptionServiceName, `lambda subscription not supported for FIFO topics.`);
        }

        const { handler, listener } = subscription;

        const internalName = getInternalName(service, handler.name);

        let handlerState = tryGetFunctionState(context, internalName, options);

        if (!handlerState) {
          const subscriptionTimeout = subscription.timeout ?? 30;
          const subscriptionMemory = subscription.memory ?? 192;

          handlerState = createSubscriptionFunction(state, context.role, {
            functionName: getFunctionName(service, handler.name, options),
            description: handler.description,
            messageSchema: service.schema,
            timeout: subscriptionTimeout,
            memory: subscriptionMemory,
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

        createSubscription(state, topicState, handlerState, {
          fromService: handlerState.parameters.functionName
        });

        break;
      }

      case NotificationSubscriptionType.Queue: {
        const queueState = getQueueState(context, subscription.service, options);

        createSubscription(state, topicState, queueState, {
          fromService: queueState.parameters.queueName
        });

        break;
      }
    }
  }
};

export const connectSubscriptions = (
  state: EntryStates,
  service: NotificationService | NotificationImport,
  options: DeployOptions,
  context: EventContext
) => {
  if (!service.extras) {
    return;
  }

  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  for (const subscription of service.subscriptions) {
    switch (subscription.type) {
      default:
        throw new InvalidParameterError(SubscriptionServiceName, `subscription not supported.`);

      case NotificationSubscriptionType.Lambda: {
        const internalName = getInternalName(service, subscription.handler.name);
        const handlerState = getFunctionState(context, internalName, options);

        linkServiceExtras(state, handlerState.entryId, service.extras);
        break;
      }

      case NotificationSubscriptionType.Queue: {
        const queueState = getQueueState(context, subscription.service, options);

        linkServiceExtras(state, queueState.entryId, service.extras);
        break;
      }
    }
  }
};
