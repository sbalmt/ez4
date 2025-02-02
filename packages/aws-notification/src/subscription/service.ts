import type { EntryState, EntryStates, StepContext } from '@ez4/stateful';
import type { FunctionState } from '@ez4/aws-function';
import type { TopicState } from '../topic/types.js';
import type { SubscriptionState } from './types.js';

import { createPermission, getFunctionArn, getPermission } from '@ez4/aws-function';
import { getAccountId, getRegion } from '@ez4/aws-identity';
import { attachEntry } from '@ez4/stateful';
import { hashData } from '@ez4/utils';

import { getTopicArn } from '../topic/utils.js';
import { TopicServiceName } from '../topic/types.js';
import { SubscriptionServiceName, SubscriptionServiceType } from './types.js';

export const createSubscription = <E extends EntryState>(
  state: EntryStates<E>,
  topicState: TopicState,
  endpointState: FunctionState
) => {
  const topicName = topicState.parameters.topicName;

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

  const subscriptionId = hashData(
    SubscriptionServiceType,
    topicState.entryId,
    endpointState.entryId
  );

  return attachEntry<E | SubscriptionState, SubscriptionState>(state, {
    type: SubscriptionServiceType,
    entryId: subscriptionId,
    dependencies: [topicState.entryId, endpointState.entryId, permissionState.entryId],
    parameters: {
      getTopicArn: (context: StepContext) => {
        return getTopicArn(TopicServiceName, subscriptionId, context);
      },
      getEndpoint: (context: StepContext) => {
        return getFunctionArn(SubscriptionServiceName, subscriptionId, context);
      }
    }
  });
};
