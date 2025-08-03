import type { EntryState, EntryStates, StepContext } from '@ez4/stateful';
import type { FunctionState } from '@ez4/aws-function';
import type { QueueState } from '@ez4/aws-queue';
import type { TopicState } from '../topic/types.js';
import type { SubscriptionParameters, SubscriptionState } from './types.js';

import { createPermission, getFunctionArn, getPermission, isFunctionState } from '@ez4/aws-function';
import { attachQueuePolicy, getQueueArn, isQueueState } from '@ez4/aws-queue';
import { getAccountId, getRegion } from '@ez4/aws-identity';
import { attachEntry } from '@ez4/stateful';
import { hashData } from '@ez4/utils';

import { getTopicArn } from '../topic/utils.js';
import { TopicServiceName } from '../topic/types.js';
import { buildNotificationArn } from '../utils/policy.js';
import { SubscriptionServiceName, SubscriptionServiceType } from './types.js';

export const createSubscription = <E extends EntryState>(
  state: EntryStates<E>,
  topicState: TopicState,
  endpointState: FunctionState | QueueState,
  parameters: Pick<SubscriptionParameters, 'fromService'>
) => {
  const topicName = topicState.parameters.topicName;

  const dependencies = [topicState.entryId, endpointState.entryId];

  if (isFunctionState(endpointState)) {
    const permissionState =
      getPermission(state, topicState, endpointState) ??
      createPermission(state, topicState, endpointState, {
        fromService: parameters.fromService,
        getPermission: async () => {
          const [region, account] = await Promise.all([getRegion(), getAccountId()]);

          return {
            principal: 'sns.amazonaws.com',
            sourceArn: buildNotificationArn(topicName, region, account)
          };
        }
      });

    dependencies.push(permissionState.entryId);
  }

  if (isQueueState(endpointState)) {
    const policyState = attachQueuePolicy(state, endpointState, topicState, {
      fromService: parameters.fromService,
      policyGetters: [
        async () => {
          const [region, account] = await Promise.all([getRegion(), getAccountId()]);

          return {
            principal: 'sns.amazonaws.com',
            sourceArn: buildNotificationArn(topicName, region, account)
          };
        }
      ]
    });

    dependencies.push(policyState.entryId);
  }

  const subscriptionId = hashData(SubscriptionServiceType, topicState.entryId, endpointState.entryId);

  return attachEntry<E | SubscriptionState, SubscriptionState>(state, {
    type: SubscriptionServiceType,
    entryId: subscriptionId,
    dependencies,
    parameters: {
      ...parameters,
      getTopicArn: (context: StepContext) => {
        return getTopicArn(TopicServiceName, subscriptionId, context);
      },
      getEndpoint: (context: StepContext) => {
        if (isFunctionState(endpointState)) {
          return getFunctionArn(SubscriptionServiceName, subscriptionId, context);
        }

        return getQueueArn(SubscriptionServiceName, subscriptionId, context);
      }
    }
  });
};
