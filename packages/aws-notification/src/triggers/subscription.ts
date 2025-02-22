import type { NotificationService, NotificationImport } from '@ez4/notification/library';
import type { DeployOptions } from '@ez4/project/library';
import type { RoleState } from '@ez4/aws-identity';
import type { EntryStates } from '@ez4/stateful';
import type { TopicState } from '../topic/types.js';

import { NotificationSubscriptionType } from '@ez4/notification/library';
import { getServiceName, linkServiceExtras } from '@ez4/project/library';
import { InvalidParameterError } from '@ez4/aws-common';
import { getFunction } from '@ez4/aws-function';
import { getQueue } from '@ez4/aws-queue';
import { toKebabCase } from '@ez4/utils';

import { SubscriptionServiceName } from '../subscription/types.js';
import { createSubscriptionFunction } from '../subscription/function/service.js';
import { createSubscription } from '../subscription/service.js';
import { SubscriptionMissingError } from './errors.js';

export const prepareSubscriptions = async (
  state: EntryStates,
  service: NotificationService | NotificationImport,
  role: RoleState,
  topicState: TopicState,
  options: DeployOptions
) => {
  for (const subscription of service.subscriptions) {
    switch (subscription.type) {
      default:
        throw new InvalidParameterError(SubscriptionServiceName, `subscription not supported.`);

      case NotificationSubscriptionType.Lambda: {
        const handler = subscription.handler;

        const functionName = getFunctionName(service, handler.name, options);

        const functionState =
          getFunction(state, role, functionName) ??
          createSubscriptionFunction(state, role, {
            functionName,
            description: handler.description,
            sourceFile: handler.file,
            handlerName: handler.name,
            timeout: subscription.timeout,
            memory: subscription.memory,
            messageSchema: service.schema,
            extras: service.extras,
            debug: options.debug,
            variables: {
              ...service.variables,
              ...subscription.variables
            }
          });

        createSubscription(state, topicState, functionState);
        break;
      }

      case NotificationSubscriptionType.Queue: {
        const queueName = getServiceName(subscription.service, options);
        const queueState = getQueue(state, queueName);

        if (!queueState) {
          throw new SubscriptionMissingError(queueName);
        }

        createSubscription(state, topicState, queueState);
        break;
      }
    }
  }
};

export const connectSubscriptions = (
  state: EntryStates,
  service: NotificationService | NotificationImport,
  role: RoleState,
  options: DeployOptions
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
        const queueName = getServiceName(subscription.service, options);
        const queueState = getQueue(state, queueName);

        if (!queueState) {
          throw new SubscriptionMissingError(queueName);
        }

        linkServiceExtras(state, queueState.entryId, service.extras);
        break;
      }
    }
  }
};

export const getFunctionName = (
  service: NotificationService | NotificationImport,
  handlerName: string,
  options: DeployOptions
) => {
  return `${getServiceName(service, options)}-${toKebabCase(handlerName)}`;
};
