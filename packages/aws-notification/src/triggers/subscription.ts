import type { NotificationService, NotificationImport } from '@ez4/notification/library';
import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { RoleState } from '@ez4/aws-identity';
import type { EntryStates } from '@ez4/stateful';
import type { TopicState } from '../topic/types.js';

import { linkServiceExtras } from '@ez4/project/library';
import { NotificationSubscriptionType } from '@ez4/notification/library';
import { InvalidParameterError } from '@ez4/aws-common';
import { getQueueState } from '@ez4/aws-queue';
import { getFunction } from '@ez4/aws-function';

import { SubscriptionServiceName } from '../subscription/types.js';
import { createSubscriptionFunction } from '../subscription/function/service.js';
import { createSubscription } from '../subscription/service.js';
import { SubscriptionMissingError } from './errors.js';
import { getFunctionName } from './utils.js';

export const prepareSubscriptions = async (
  state: EntryStates,
  service: NotificationService | NotificationImport,
  role: RoleState,
  topicState: TopicState,
  options: DeployOptions,
  context: EventContext
) => {
  for (const subscription of service.subscriptions) {
    switch (subscription.type) {
      default:
        throw new InvalidParameterError(SubscriptionServiceName, `subscription not supported.`);

      case NotificationSubscriptionType.Lambda: {
        const { handler, listener } = subscription;

        const functionName = getFunctionName(service, handler.name, options);
        const functionTimeout = subscription.timeout ?? 30;
        const functionMemory = subscription.memory ?? 192;

        const functionState =
          getFunction(state, role, functionName) ??
          createSubscriptionFunction(state, role, {
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

        createSubscription(state, topicState, functionState, {
          fromService: functionName
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
  role: RoleState,
  options: DeployOptions,
  context: EventContext
) => {
  if (!service.extras) {
    return;
  }

  for (const subscription of service.subscriptions) {
    switch (subscription.type) {
      default:
        throw new InvalidParameterError(SubscriptionServiceName, `subscription not supported.`);

      case NotificationSubscriptionType.Lambda: {
        const functionName = getFunctionName(service, subscription.handler.name, options);
        const functionState = getFunction(state, role, functionName);

        if (!functionState) {
          throw new SubscriptionMissingError(functionName);
        }

        linkServiceExtras(state, functionState.entryId, service.extras);
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
