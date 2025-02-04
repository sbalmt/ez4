import type { StepContext, StepHandler } from '@ez4/stateful';
import type { SubscriptionState, SubscriptionResult } from './types.js';

import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { SubscriptionServiceName } from './types.js';
import { createSubscription, deleteSubscription } from './client.js';
import { getSubscriptionProtocol } from './helpers/protocol.js';

export const getSubscriptionHandler = (): StepHandler<SubscriptionState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: SubscriptionState, current: SubscriptionState) => {
  return !!candidate.result && candidate.result.subscriptionArn === current.result?.subscriptionArn;
};

const previewResource = async (candidate: SubscriptionState, current: SubscriptionState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source, {
    exclude: {
      getTopicArn: true,
      getEndpoint: true
    }
  });

  return changes.counts ? changes : undefined;
};

const replaceResource = async (
  candidate: SubscriptionState,
  current: SubscriptionState,
  context: StepContext
) => {
  if (current.result) {
    throw new ReplaceResourceError(SubscriptionServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (
  candidate: SubscriptionState,
  context: StepContext
): Promise<SubscriptionResult> => {
  const parameters = candidate.parameters;

  const [topicArn, endpoint] = await Promise.all([
    parameters.getTopicArn(context),
    parameters.getEndpoint(context)
  ]);

  const { subscriptionArn } = await createSubscription({
    protocol: getSubscriptionProtocol(SubscriptionServiceName, endpoint),
    topicArn,
    endpoint
  });

  return {
    subscriptionArn,
    topicArn,
    endpoint
  };
};

const updateResource = async () => {};

const deleteResource = async (candidate: SubscriptionState) => {
  const { result } = candidate;

  if (result) {
    await deleteSubscription(result.subscriptionArn);
  }
};
