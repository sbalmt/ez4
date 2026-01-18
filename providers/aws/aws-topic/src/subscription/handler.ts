import type { StepContext, StepHandler } from '@ez4/stateful';
import type { SubscriptionState, SubscriptionResult } from './types';

import { Logger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { getSubscriptionProtocol } from './helpers/protocol';
import { createSubscription, deleteSubscription } from './client';
import { SubscriptionServiceName } from './types';

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

const previewResource = (candidate: SubscriptionState, current: SubscriptionState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source, {
    exclude: {
      getTopicArn: true,
      getEndpoint: true
    }
  });

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.fromService
  };
};

const replaceResource = async (candidate: SubscriptionState, current: SubscriptionState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(SubscriptionServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (candidate: SubscriptionState, context: StepContext): Promise<SubscriptionResult> => {
  const { parameters } = candidate;

  return Logger.logOperation(SubscriptionServiceName, parameters.fromService, 'creation', async (logger) => {
    const [topicArn, endpoint] = await Promise.all([parameters.getTopicArn(context), parameters.getEndpoint(context)]);

    const { subscriptionArn } = await createSubscription(logger, {
      protocol: getSubscriptionProtocol(SubscriptionServiceName, endpoint),
      topicArn,
      endpoint
    });

    return {
      subscriptionArn,
      topicArn,
      endpoint
    };
  });
};

const updateResource = async () => {};

const deleteResource = async (current: SubscriptionState) => {
  const { result, parameters } = current;

  if (!result) {
    return;
  }

  await Logger.logOperation(SubscriptionServiceName, parameters.fromService, 'deletion', async (logger) => {
    await deleteSubscription(logger, result.subscriptionArn);
  });
};
