import type { StepHandler } from '@ez4/stateful';
import type { TopicState, TopicResult, TopicParameters } from './types';

import { applyTagUpdates, CorruptedResourceError, Logger, ReplaceResourceError } from '@ez4/aws-common';
import { getAccountId, getRegion } from '@ez4/aws-identity';
import { deepCompare } from '@ez4/utils';

import { buildTopicArn } from '../utils/policy';
import { createTopic, deleteTopic, tagTopic, untagTopic } from './client';
import { TopicServiceName } from './types';

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

const previewResource = (candidate: TopicState, current: TopicState) => {
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

const createResource = (candidate: TopicState): Promise<TopicResult> => {
  const { parameters } = candidate;

  return Logger.logOperation(TopicServiceName, parameters.topicName, 'creation', async (logger) => {
    if (parameters.import) {
      const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

      return {
        topicArn: buildTopicArn(parameters.topicName, region, accountId)
      };
    }

    const { topicArn } = await createTopic(logger, parameters);

    return {
      topicArn
    };
  });
};

const updateResource = (candidate: TopicState, current: TopicState): Promise<TopicResult> => {
  const { result, parameters } = candidate;
  const { topicName } = parameters;

  if (!result) {
    throw new CorruptedResourceError(TopicServiceName, topicName);
  }

  if (parameters.import) {
    return Promise.resolve(result);
  }

  return Logger.logOperation(TopicServiceName, topicName, 'updates', async (logger) => {
    await checkTagUpdates(logger, result.topicArn, parameters, current.parameters);

    return result;
  });
};

const deleteResource = async (current: TopicState) => {
  const { result, parameters } = current;

  if (!result || parameters.import) {
    return;
  }

  await Logger.logOperation(TopicServiceName, parameters.topicName, 'deletion', async (logger) => {
    await deleteTopic(logger, result.topicArn);
  });
};

const checkTagUpdates = async (logger: Logger.OperationLogger, topicArn: string, candidate: TopicParameters, current: TopicParameters) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagTopic(logger, topicArn, tags),
    (tags) => untagTopic(logger, topicArn, tags)
  );
};
