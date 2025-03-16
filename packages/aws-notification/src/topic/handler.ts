import type { StepHandler } from '@ez4/stateful';
import type { TopicState, TopicResult, TopicParameters } from './types.js';

import { applyTagUpdates, ReplaceResourceError } from '@ez4/aws-common';
import { getAccountId, getRegion } from '@ez4/aws-identity';
import { deepCompare } from '@ez4/utils';

import { buildNotificationArn } from '../utils/policy.js';
import { createTopic, deleteTopic, tagTopic, untagTopic } from './client.js';
import { TopicServiceName } from './types.js';

export const getTopicHandler = (): StepHandler<TopicState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: TopicState, current: TopicState) => {
  return !!candidate.result && candidate.result.topicArn === current.result?.topicArn;
};

const previewResource = async (candidate: TopicState, current: TopicState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.topicName
  };
};

const replaceResource = async (candidate: TopicState, current: TopicState) => {
  if (current.result) {
    throw new ReplaceResourceError(TopicServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = async (candidate: TopicState): Promise<TopicResult> => {
  const parameters = candidate.parameters;

  if (parameters.import) {
    const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

    return {
      topicArn: buildNotificationArn(parameters.topicName, region, accountId)
    };
  }

  const { topicArn } = await createTopic(parameters);

  return {
    topicArn
  };
};

const updateResource = async (candidate: TopicState, current: TopicState) => {
  const { result, parameters } = candidate;

  if (result && !parameters.import) {
    await checkTagUpdates(result.topicArn, parameters, current.parameters);
  }
};

const deleteResource = async (candidate: TopicState) => {
  const { result, parameters } = candidate;

  if (result && !parameters.import) {
    await deleteTopic(result.topicArn);
  }
};

const checkTagUpdates = async (topicArn: string, candidate: TopicParameters, current: TopicParameters) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagTopic(topicArn, tags),
    (tags) => untagTopic(topicArn, tags)
  );
};
