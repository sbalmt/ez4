import type { EntryState, EntryStates, StepContext } from '@ez4/stateful';
import type { FunctionState } from '@ez4/aws-function';
import type { QueueState } from '@ez4/aws-queue';
import type { TopicState } from '../topic/types.js';
import type { SubscriptionState } from './types.js';

import { getAccountId, getRegion } from '@ez4/aws-identity';
import { getQueueArn } from '@ez4/aws-queue';
import { attachEntry } from '@ez4/stateful';
import { hashData } from '@ez4/utils';

import {
  createPermission,
  getFunctionArn,
  getPermission,
  isFunctionState
} from '@ez4/aws-function';

import { getTopicArn } from '../topic/utils.js';
import { TopicServiceName } from '../topic/types.js';
import { SubscriptionServiceName, SubscriptionServiceType } from './types.js';

export const createSubscription = <E extends EntryState>(
  state: EntryStates<E>,
  topicState: TopicState,
  endpointState: FunctionState | QueueState
) => {
  const topicName = topicState.parameters.topicName;

  const dependencies = [topicState.entryId, endpointState.entryId];

  if (isFunctionState(endpointState)) {
    const permissionState =
      getPermission(state, topicState, endpointState) ??
      createPermission(state, topicState, endpointState, {
        getPermission: async () => {
          const [region, account] = await Promise.all([getRegion(), getAccountId()]);

          return {
            principal: 'sns.amazonaws.com',
            sourceArn: `arn:aws:sns:${region}:${account}:${topicName}`
          };
        }
      });

    dependencies.push(permissionState.entryId);
  }

  const subscriptionId = hashData(
    SubscriptionServiceType,
    topicState.entryId,
    endpointState.entryId
  );

  return attachEntry<E | SubscriptionState, SubscriptionState>(state, {
    type: SubscriptionServiceType,
    entryId: subscriptionId,
    dependencies,
    parameters: {
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
