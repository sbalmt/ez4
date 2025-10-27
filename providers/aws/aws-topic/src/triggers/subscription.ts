import type { TopicService, TopicImport } from '@ez4/topic/library';
import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryStates } from '@ez4/stateful';
import type { TopicState } from '../topic/types';

import { linkServiceExtras } from '@ez4/project/library';
import { TopicSubscriptionType } from '@ez4/topic/library';
import { getFunctionState, tryGetFunctionState } from '@ez4/aws-function';
import { InvalidParameterError } from '@ez4/aws-common';
import { isRoleState } from '@ez4/aws-identity';
import { createLogGroup } from '@ez4/aws-logs';
import { getQueueState } from '@ez4/aws-queue';

import { SubscriptionServiceName } from '../subscription/types';
import { createSubscriptionFunction } from '../subscription/function/service';
import { createSubscription } from '../subscription/service';
import { getFunctionName, getInternalName } from './utils';
import { RoleMissingError } from './errors';
import { Defaults } from './defaults';

export const prepareSubscriptions = (
  state: EntryStates,
  service: TopicService | TopicImport,
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

      case TopicSubscriptionType.Lambda: {
        if (service.fifoMode) {
          throw new InvalidParameterError(SubscriptionServiceName, `lambda subscription not supported for FIFO topics.`);
        }

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

          handlerState = createSubscriptionFunction(state, context.role, logGroupState, {
            functionName: subscriptionName,
            description: handler.description,
            messageSchema: service.schema,
            timeout: subscription.timeout ?? Defaults.Timeout,
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

        createSubscription(state, topicState, handlerState, {
          fromService: handlerState.parameters.functionName
        });

        break;
      }

      case TopicSubscriptionType.Queue: {
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
  service: TopicService | TopicImport,
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

      case TopicSubscriptionType.Lambda: {
        const internalName = getInternalName(service, subscription.handler.name);
        const handlerState = getFunctionState(context, internalName, options);

        linkServiceExtras(state, handlerState.entryId, service.extras);
        break;
      }

      case TopicSubscriptionType.Queue: {
        const queueState = getQueueState(context, subscription.service, options);

        linkServiceExtras(state, queueState.entryId, service.extras);
        break;
      }
    }
  }
};
